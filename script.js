document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'F12' || e.keyCode === 123) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'i' || e.key === 'I')) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'c' || e.key === 'C')) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'j' || e.key === 'J')) e.preventDefault();
});

(function() {
    const CONFIG = {
        WEBHOOKS: {
            ACOES: "https://discord.com/api/webhooks/1500271163090276362/4su-b6yUy4GISMOW_xd9pZfvIzyNYA9b26lAQwmjTbFXw64Q0a2uRg_kNtJmSZvbHlhc",
            VENDAS: "https://discord.com/api/webhooks/1500271084107468902/eQKJInfwlZNtBKNIrPnpTC_DkcS78GPPvnXOLMRHCTbYPFtSqVsVEGCoM8eHvhnqJHO_",
            LOGS_ACOES: "NAO TEM",
            LOGS_VENDAS: "NAO TEM"
        }
    };

    const WASH_TYPES = {
        "35": { name: "Lavagem Parceria", type: "padrao", pMaq: 0.20, pLuc: 0.15, pCli: 0.65 },
        "40": { name: "Lavagem Pista", type: "padrao", pMaq: 0.20, pLuc: 0.20, pCli: 0.60 },
        "pers": { name: "Lavagem Pessoal", type: "pessoal" }
    };

    const ACTIONS_JSON_PATH = "./actions.json?v=1.0";
    const EMBEDDED_ACTIONS_DATA = window.ZIGOS_ACTIONS_DATA || null;
    const FAVORITES_STORAGE_KEY = "zigos_rule_favorites";
    const RECENT_ACTIONS_STORAGE_KEY = "zigos_recent_actions";
    const PARTICIPANT_PRESETS = [
        { passaporte: "129", nome: "Oda Arasaka" },
        { passaporte: "220", nome: "Thalia Duice Maeda Hall Quissanga" },
        { passaporte: "126", nome: "Marck Khalid" },
        { passaporte: "492", nome: "Matteo Kuro" },
        { passaporte: "814", nome: "Robb Stark" },
        { passaporte: "29", nome: "Diana Duice" },
        { passaporte: "277", nome: "Nyriel Kuro" },
        { passaporte: "119", nome: "PerolesxCoyote ElComedor" },
        { passaporte: "102", nome: "Boris Duice" },
        { passaporte: "911", nome: "Morgana Duice" },
        { passaporte: "467", nome: "Theodore Seville" },
        { passaporte: "641", nome: "Zak KataErva" },
        { passaporte: "640", nome: "Sota KataErva" },
        { passaporte: "385", nome: "Rafik Castellani" },
        { passaporte: "317", nome: "Bruna Castellani" },
        { passaporte: "295", nome: "Beatriz Coff LeBlanc" },
        { passaporte: "730", nome: "Lavinia Hastings Montibeller Silverhand" },
        { passaporte: "270", nome: "Becky MavenTwo" },
        { passaporte: "190", nome: "Aline Hoffman" },
        { passaporte: "138", nome: "Polly Bocket" },
        { passaporte: "397", nome: "Nero Khalid" },
        { passaporte: "485", nome: "Moura Duice" },
        { passaporte: "383", nome: "Nicolly Blanck" },
        { passaporte: "196", nome: "Luan Zucci" },
        { passaporte: "368", nome: "Yummi Duice" },
        { passaporte: "539", nome: "Liz AmaetraiDuice" }
    ];

    window.app = {
        state: {
            participants: new Set(),
            cart: [],
            selectedItemId: null,
            isAdmin: false,
            actionData: { groups: [], details: {} },
            ruleFavorites: new Set(),
            selectedRuleAction: "",
            showAllRules: false,
            recentActions: [],
            allActionNames: [],
            selectedActionName: "",
            showAllActionOptions: false,
            selectedParticipantValue: "",
            discountOn: false
        },
        dom: {},

        async init() {
            this.cacheDOM();
            this.setDefaults();
            this.renderCatalog();
            this.initTheme();
            this.initAdminSettings();
            this.initRuleFavorites();
            this.initRecentActions();
            this.bindRuleEvents();
            this.registerServiceWorker();
            await this.loadActionData();
        },

        cacheDOM() {
            const ids = [
                "acao-tipo", "acao-search", "acao-action-list", "acao-empty", "acao-show-all", "acao-helper", "acao-selected-display", "acao-data", "acao-hora", "novo-participante", "participant-action-list", "participant-empty", "lista-participantes",
                "venda-vendedor", "seller-action-list", "seller-empty", "venda-faccao", "venda-data", "venda-hora", "venda-valor",
                "sales-catalog", "price-controls", "select-msg", "cart-items", "cart-summary-area",
                "cart-production-area", "mats-list-display", "sales-production-details",
                "toast-container", "regras-acao-tipo", "regras-search", "regras-favorites",
                "regras-action-list", "regras-empty", "acao-info-regras", "regras-recent",
                "regras-show-all", "regras-helper"
            ];

            ids.forEach((id) => {
                const el = document.getElementById(id);
                if (el) this.dom[id] = el;
            });
        },

        initTheme() {
            const themeToggle = document.getElementById("theme-toggle");
            const savedTheme = localStorage.getItem("zigos_theme");

            if (savedTheme === "light") {
                document.body.classList.add("light-mode");
                if (themeToggle) {
                    themeToggle.querySelector(".icon-sun").style.display = "none";
                    themeToggle.querySelector(".icon-moon").style.display = "inline";
                }
            }

            if (themeToggle) {
                themeToggle.addEventListener("click", () => {
                    document.body.classList.toggle("light-mode");
                    const isLight = document.body.classList.contains("light-mode");

                    localStorage.setItem("zigos_theme", isLight ? "light" : "dark");

                    themeToggle.querySelector(".icon-sun").style.display = isLight ? "none" : "inline";
                    themeToggle.querySelector(".icon-moon").style.display = isLight ? "inline" : "none";
                });
            }
        },

        initAdminSettings() {
            const savedColor = localStorage.getItem("zigos_color");
            const colorPicker = document.getElementById("admin-color");
            if (savedColor) {
                this.applyColor(savedColor);
                if (colorPicker) colorPicker.value = savedColor;
            } else if (colorPicker) {
                colorPicker.value = "#106B3A";
            }

            if (colorPicker) {
                colorPicker.addEventListener("input", (e) => {
                    this.applyColor(e.target.value);
                    localStorage.setItem("zigos_color", e.target.value);
                });
            }

            const savedName = localStorage.getItem("zigos_default_user");
            if (savedName) {
                const inputName = document.getElementById("admin-default-user");
                const vendaName = document.getElementById("venda-vendedor");
                if (inputName) inputName.value = savedName;
                if (vendaName) vendaName.value = savedName;
            }
        },

        initRuleFavorites() {
            try {
                const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
                const favorites = raw ? JSON.parse(raw) : [];
                this.state.ruleFavorites = new Set(Array.isArray(favorites) ? favorites : []);
            } catch (error) {
                this.state.ruleFavorites = new Set();
            }
        },

        initRecentActions() {
            try {
                const raw = localStorage.getItem(RECENT_ACTIONS_STORAGE_KEY);
                const recent = raw ? JSON.parse(raw) : [];
                this.state.recentActions = Array.isArray(recent) ? recent : [];
            } catch (error) {
                this.state.recentActions = [];
            }
        },

        bindRuleEvents() {
            if (this.dom["regras-search"]) {
                this.dom["regras-search"].addEventListener("input", (event) => {
                    this.renderRulesExplorer(event.target.value);
                });
            }

            if (this.dom["acao-search"]) {
                this.dom["acao-search"].addEventListener("input", (event) => {
                    this.renderActionPicker(event.target.value);
                });
            }

            if (this.dom["novo-participante"]) {
                this.dom["novo-participante"].addEventListener("input", (event) => {
                    this.renderParticipantSuggestions(event.target.value);
                });
            }

            if (this.dom["venda-vendedor"]) {
                this.dom["venda-vendedor"].addEventListener("input", (event) => {
                    this.renderSellerSuggestions(event.target.value);
                });
            }

            if (this.dom["regras-acao-tipo"]) {
                this.dom["regras-acao-tipo"].addEventListener("change", () => {
                    this.checkRegrasTipo();
                });
            }
        },

        registerServiceWorker() {
            if (!("serviceWorker" in navigator)) return;
            if (!window.isSecureContext) return;

            window.addEventListener("load", () => {
                navigator.serviceWorker.register("./service-worker.js").catch((error) => {
                    console.error("Falha ao registrar service worker", error);
                });
            });
        },

        async loadActionData() {
            if (EMBEDDED_ACTIONS_DATA && EMBEDDED_ACTIONS_DATA.details) {
                this.state.actionData = {
                    groups: Array.isArray(EMBEDDED_ACTIONS_DATA.groups) ? EMBEDDED_ACTIONS_DATA.groups : [],
                    details: EMBEDDED_ACTIONS_DATA.details || {}
                };
                this.state.allActionNames = Object.keys(this.state.actionData.details);

                this.renderActionSelectOptions();
                this.renderActionPicker();
                this.renderParticipantSuggestions();
                this.renderSellerSuggestions();
                this.renderRulesExplorer();
                return;
            }

            try {
                const response = await fetch(ACTIONS_JSON_PATH, { cache: "no-store" });
                if (!response.ok) throw new Error(`Falha ao carregar actions.json (${response.status})`);

                const data = await response.json();
                this.state.actionData = {
                    groups: Array.isArray(data.groups) ? data.groups : [],
                    details: data.details || {}
                };
                this.state.allActionNames = Object.keys(this.state.actionData.details);

                this.renderActionSelectOptions();
                this.renderActionPicker();
                this.renderParticipantSuggestions();
                this.renderSellerSuggestions();
                this.renderRulesExplorer();
            } catch (error) {
                console.error(error);
                this.showToast("Não foi possível carregar as ações.", "error");
            }
        },

        renderActionSelectOptions() {
            const acaoSelect = this.dom["acao-tipo"];
            const regrasSelect = this.dom["regras-acao-tipo"];
            if (acaoSelect) {
                acaoSelect.innerHTML = '<option value="" disabled selected>Selecione a ação...</option>';
            }

            if (regrasSelect) {
                regrasSelect.innerHTML = '<option value="" disabled selected>Escolha uma ação...</option>';
            }

            this.state.actionData.groups.forEach((group) => {
                if (acaoSelect) acaoSelect.appendChild(this.buildOptGroup(group));
                if (regrasSelect) regrasSelect.appendChild(this.buildOptGroup(group));
            });
        },

        buildOptGroup(group) {
            const optgroup = document.createElement("optgroup");
            optgroup.label = group.label;
            (group.actions || []).forEach((actionName) => {
                const option = document.createElement("option");
                option.value = actionName;
                option.textContent = actionName;
                optgroup.appendChild(option);
            });
            return optgroup;
        },

        applyColor(hexColor) {
            document.documentElement.style.setProperty("--primary", hexColor);

            const darken = "#" + hexColor
                .replace(/^#/, "")
                .replace(/../g, (color) => ("0" + Math.min(255, Math.max(0, parseInt(color, 16) - 40)).toString(16)).slice(-2));
            document.documentElement.style.setProperty("--primary-dark", darken);

            let cleanHex = hexColor.replace("#", "");
            if (cleanHex.length === 3) {
                cleanHex = cleanHex.split("").map((char) => char + char).join("");
            }

            const r = parseInt(cleanHex.substring(0, 2), 16) || 16;
            const g = parseInt(cleanHex.substring(2, 4), 16) || 107;
            const b = parseInt(cleanHex.substring(4, 6), 16) || 58;

            document.documentElement.style.setProperty("--primary-rgb", `${r}, ${g}, ${b}`);
        },

        resetColor() {
            localStorage.removeItem("zigos_color");
            this.applyColor("#106B3A");
            const colorPicker = document.getElementById("admin-color");
            if (colorPicker) colorPicker.value = "#106B3A";
            this.showToast("Cor restaurada para o padrão!");
        },

        saveDefaultUser(name) {
            localStorage.setItem("zigos_default_user", name);
            const vendaName = document.getElementById("venda-vendedor");
            if (vendaName) vendaName.value = name;
        },

        hardReset() {
            if (confirm("⚠️ TEM CERTEZA? Isso vai apagar seu tema, sua cor e todos os nomes salvos localmente!")) {
                localStorage.removeItem("zigos_theme");
                localStorage.removeItem("zigos_color");
                localStorage.removeItem("zigos_default_user");
                localStorage.removeItem(FAVORITES_STORAGE_KEY);
                alert("Sistema zerado. A página será recarregada.");
                location.reload();
            }
        },

        setDefaults() {
            const now = new Date();
            const dateStr = new Intl.DateTimeFormat("en-CA", {
                timeZone: "America/Sao_Paulo",
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }).format(now);
            const timeStr = new Intl.DateTimeFormat("pt-BR", {
                timeZone: "America/Sao_Paulo",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            }).format(now);

            ["acao", "venda"].forEach((prefix) => {
                if (this.dom[`${prefix}-data`]) this.dom[`${prefix}-data`].value = dateStr;
                if (this.dom[`${prefix}-hora`]) this.dom[`${prefix}-hora`].value = timeStr;
            });
        },

        switchTab(tabId, event) {
            document.querySelectorAll(".section").forEach((section) => section.classList.remove("active"));
            document.querySelectorAll(".nav-btn").forEach((button) => button.classList.remove("active"));
            const nextSection = document.getElementById(tabId);
            nextSection.classList.add("active");
            nextSection.classList.remove("animate-in");
            void nextSection.offsetWidth;
            nextSection.classList.add("animate-in");
            if (event) event.currentTarget.classList.add("active");
        },

        toggleAdmin() {
            if (this.state.isAdmin) return;
            this.state.isAdmin = true;
            this.showToast("Modo Admin liberado!", "success");

            const nav = document.getElementById("nav-menu");
            const btn = document.createElement("button");
            btn.className = "nav-btn";
            btn.innerText = "⚙️ Admin";
            btn.id = "btn-tab-admin";
            btn.onclick = (e) => app.switchTab("admin-panel", e);
            nav.appendChild(btn);

            this.switchTab("admin-panel");
            document.querySelectorAll(".nav-btn").forEach((button) => button.classList.remove("active"));
            btn.classList.add("active");
        },

        normalizeText(text = "") {
            return text
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase();
        },

        getAllActionNames() {
            return this.state.allActionNames;
        },

        renderActionPicker(filterText = "") {
            const listContainer = this.dom["acao-action-list"];
            const emptyState = this.dom["acao-empty"];
            const helper = this.dom["acao-helper"];
            const showAllButton = this.dom["acao-show-all"];
            const selectedDisplay = this.dom["acao-selected-display"];
            if (!listContainer || !emptyState) return;

            const normalizedFilter = this.normalizeText(filterText.trim());
            const allNames = this.getAllActionNames();
            const shouldShowAll = this.state.showAllActionOptions || Boolean(normalizedFilter);
            const filteredNames = normalizedFilter
                ? allNames.filter((name) => this.normalizeText(name).includes(normalizedFilter))
                : (shouldShowAll ? allNames : []);

            listContainer.innerHTML = filteredNames
                .map((name) => this.renderActionOptionCard(name))
                .join("");

            if (normalizedFilter && !allNames.some((name) => this.normalizeText(name) === normalizedFilter)) {
                listContainer.innerHTML += this.renderManualActionCard(filterText.trim());
            }

            if (helper) helper.style.display = shouldShowAll ? "none" : "block";
            if (showAllButton) showAllButton.textContent = this.state.showAllActionOptions ? "Ocultar lista" : "Mostrar todas";
            emptyState.style.display = shouldShowAll && !filteredNames.length ? "block" : "none";

            if (selectedDisplay) {
                selectedDisplay.textContent = this.state.selectedActionName || "Nenhuma ação selecionada.";
            }

            this.applyStaggerAnimation(listContainer, ".rule-action-card");
        },

        renderActionOptionCard(name) {
            const isActive = this.state.selectedActionName === name ? " active" : "";
            const details = this.state.actionData.details[name] || {};
            const subtitle = details.cartao ? details.cartao : "Selecionar ação";

            return `
                <button class="rule-action-card${isActive}" type="button" onclick="app.selectActionForRegister('${this.escapeForSingleQuote(name)}')">
                    <div class="rule-action-card-main">
                        <strong>${name}</strong>
                        <span>${subtitle}</span>
                    </div>
                </button>
            `;
        },

        renderManualActionCard(rawValue) {
            const safeValue = this.escapeForSingleQuote(rawValue);
            return `
                <button class="rule-action-card" type="button" onclick="app.selectManualAction('${safeValue}')">
                    <div class="rule-action-card-main">
                        <strong>${rawValue}</strong>
                        <span>Adicionar ação manual</span>
                    </div>
                </button>
            `;
        },

        renderRulesExplorer(filterText = "") {
            const listContainer = this.dom["regras-action-list"];
            const favoritesContainer = this.dom["regras-favorites"];
            const emptyState = this.dom["regras-empty"];
            const recentContainer = this.dom["regras-recent"];
            const helper = this.dom["regras-helper"];
            const showAllButton = this.dom["regras-show-all"];
            if (!listContainer || !favoritesContainer || !emptyState) return;

            const normalizedFilter = this.normalizeText(filterText.trim());
            const allNames = this.getAllActionNames();
            const shouldShowAll = this.state.showAllRules || Boolean(normalizedFilter);
            const filteredNames = normalizedFilter
                ? allNames.filter((name) => this.normalizeText(name).includes(normalizedFilter))
                : (shouldShowAll ? allNames : []);

            const favoriteNames = [...this.state.ruleFavorites].filter((name) => allNames.includes(name));
            const recentNames = this.state.recentActions.filter((name) => allNames.includes(name));

            favoritesContainer.innerHTML = favoriteNames.length
                ? favoriteNames.map((name) => this.renderFavoriteChip(name)).join("")
                : '<p class="rules-empty-favorites">Nenhum favorito salvo ainda. Clique na estrela de uma ação para fixar aqui.</p>';

            if (recentContainer) {
                recentContainer.innerHTML = recentNames.length
                    ? recentNames.map((name) => this.renderFavoriteChip(name)).join("")
                    : '<p class="rules-empty-favorites">Nenhuma consulta recente ainda.</p>';
            }

            listContainer.innerHTML = filteredNames
                .map((name) => this.renderRuleActionCard(name))
                .join("");

            if (helper) {
                helper.style.display = shouldShowAll ? "none" : "block";
            }

            if (showAllButton) {
                showAllButton.textContent = this.state.showAllRules ? "Ocultar lista" : "Mostrar todas";
            }

            emptyState.style.display = shouldShowAll && !filteredNames.length ? "block" : "none";
            this.applyStaggerAnimation(listContainer, ".rule-action-card");
            if (favoritesContainer) this.applyStaggerAnimation(favoritesContainer, ".favorite-chip");
            if (recentContainer) this.applyStaggerAnimation(recentContainer, ".favorite-chip");
        },

        renderFavoriteChip(name) {
            const isActive = this.state.selectedRuleAction === name ? " active" : "";
            return `
                <button class="favorite-chip${isActive}" type="button" onclick="app.selectRuleAction('${this.escapeForSingleQuote(name)}')">
                    <span>★</span>${name}
                </button>
            `;
        },

        renderRuleActionCard(name) {
            const isFavorite = this.state.ruleFavorites.has(name);
            const isActive = this.state.selectedRuleAction === name ? " active" : "";
            const details = this.state.actionData.details[name] || {};
            const subtitle = details.cartao ? details.cartao : "Consultar regras";

            return `
                <button class="rule-action-card${isActive}" type="button" onclick="app.selectRuleAction('${this.escapeForSingleQuote(name)}')">
                    <div class="rule-action-card-main">
                        <strong>${name}</strong>
                        <span>${subtitle}</span>
                    </div>
                    <span
                        class="rule-favorite-toggle${isFavorite ? " active" : ""}"
                        title="${isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}"
                        onclick="app.toggleFavoriteAction('${this.escapeForSingleQuote(name)}', event)"
                    >★</span>
                </button>
            `;
        },

        escapeForSingleQuote(text) {
            return String(text).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
        },

        selectRuleAction(actionName) {
            this.state.selectedRuleAction = actionName;
            this.pushRecentAction(actionName);

            if (this.dom["regras-acao-tipo"]) {
                this.dom["regras-acao-tipo"].value = actionName;
            }

            this.renderActionRules(actionName, "acao-info-regras");
            this.renderRulesExplorer(this.dom["regras-search"] ? this.dom["regras-search"].value : "");
        },

        selectActionForRegister(actionName) {
            this.state.selectedActionName = actionName;
            if (this.dom["acao-tipo"]) this.dom["acao-tipo"].value = actionName;
            if (this.dom["acao-search"]) this.dom["acao-search"].value = actionName;
            this.renderActionPicker(this.dom["acao-search"] ? this.dom["acao-search"].value : "");
        },

        selectManualAction(actionName) {
            const value = actionName.trim();
            if (!value) return;
            this.state.selectedActionName = value;
            if (this.dom["acao-tipo"]) this.dom["acao-tipo"].value = "";
            if (this.dom["acao-search"]) this.dom["acao-search"].value = value;
            this.renderActionPicker(value);
        },

        toggleFavoriteAction(actionName, event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }

            if (this.state.ruleFavorites.has(actionName)) {
                this.state.ruleFavorites.delete(actionName);
                this.showToast("Ação removida dos favoritos.");
            } else {
                this.state.ruleFavorites.add(actionName);
                this.showToast("Ação adicionada aos favoritos!");
            }

            localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...this.state.ruleFavorites]));
            this.renderRulesExplorer(this.dom["regras-search"] ? this.dom["regras-search"].value : "");
        },

        toggleShowAllRules() {
            this.state.showAllRules = !this.state.showAllRules;
            this.renderRulesExplorer(this.dom["regras-search"] ? this.dom["regras-search"].value : "");
        },

        toggleShowAllActions() {
            this.state.showAllActionOptions = !this.state.showAllActionOptions;
            this.renderActionPicker(this.dom["acao-search"] ? this.dom["acao-search"].value : "");
        },

        pushRecentAction(actionName) {
            if (!actionName) return;
            this.state.recentActions = [
                actionName,
                ...this.state.recentActions.filter((name) => name !== actionName)
            ].slice(0, 8);
            localStorage.setItem(RECENT_ACTIONS_STORAGE_KEY, JSON.stringify(this.state.recentActions));
        },

        renderActionRules(actionName, containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;

            if (!actionName || actionName === "Outro") {
                container.classList.add("hidden");
                container.innerHTML = "";
                return;
            }

            const data = this.state.actionData.details[actionName] || {
                bandidos: "-",
                policia: "-",
                refens: "-",
                armamento: "-",
                perimetro: "Não há registro de perímetro exato.",
                extras: "Consulte o manual da cidade no Discord."
            };

            const isFavorite = this.state.ruleFavorites.has(actionName);
            const favoriteLabel = isFavorite ? "Remover dos favoritos" : "Salvar nos favoritos";

            const cartaoHtml = data.cartao
                ? `
                    <div style="margin-bottom: 15px; text-align: center;">
                        <span style="display: inline-block; padding: 8px 16px; border-radius: 4px; font-weight: bold; font-size: 14px; text-transform: uppercase; background-color: ${data.bgCartao}; color: ${data.textCartao}; border: 2px solid #ffffff;">
                            Tipo de acesso: ${data.cartao}
                        </span>
                    </div>
                `
                : "";

            container.innerHTML = `
                <div class="rules-title-row">
                    <div>
                        <p class="rule-section-kicker">Ação selecionada</p>
                        <h3 class="rules-action-title">${actionName}</h3>
                    </div>
                    <button class="btn-favorite-rule${isFavorite ? " active" : ""}" type="button" onclick="app.toggleFavoriteAction('${this.escapeForSingleQuote(actionName)}', event)">
                        <span>★</span>${favoriteLabel}
                    </button>
                </div>
                ${cartaoHtml}
                <div class="rules-details-grid">
                    <div class="rule-box"><span class="rule-title">Bandidos</span><span class="rule-val">${data.bandidos}</span></div>
                    <div class="rule-box"><span class="rule-title">Polícia</span><span class="rule-val">${data.policia}</span></div>
                    <div class="rule-box"><span class="rule-title">Reféns</span><span class="rule-val">${data.refens}</span></div>
                    <div class="rule-box"><span class="rule-title">Armamento</span><span class="rule-val">${data.armamento}</span></div>
                </div>
                <div class="rule-full-box mt-10">
                    <span class="rule-title">Perímetro e posições</span>
                    <p class="rule-text">${data.perimetro}</p>
                </div>
                <div class="rule-full-box mt-10">
                    <span class="rule-title">Regras extras</span>
                    <p class="rule-text">${data.extras}</p>
                </div>
            `;
            container.classList.remove("hidden");
        },

        checkAcaoTipo() {
            const select = this.dom["acao-tipo"];
            if (select && select.value) {
                this.selectActionForRegister(select.value);
            }
        },

        getParticipantLabel(participant) {
            return `${participant.passaporte} - ${participant.nome}`;
        },

        findParticipantMatches(filterText = "") {
            const query = filterText.trim();
            const normalizedQuery = this.normalizeText(query);
            if (!query) return [];

            return PARTICIPANT_PRESETS.filter((participant) => {
                const fullLabel = this.getParticipantLabel(participant);
                return participant.passaporte.includes(query)
                    || this.normalizeText(participant.nome).includes(normalizedQuery)
                    || this.normalizeText(fullLabel).includes(normalizedQuery);
            }).slice(0, 8);
        },

        renderParticipantSuggestions(filterText = "") {
            const container = this.dom["participant-action-list"];
            const emptyState = this.dom["participant-empty"];
            if (!container || !emptyState) return;

            const query = filterText.trim();
            const normalizedQuery = this.normalizeText(query);

            if (!query) {
                container.innerHTML = "";
                emptyState.style.display = "none";
                return;
            }

            const matches = this.findParticipantMatches(query);

            container.innerHTML = matches.map((participant) => this.renderParticipantCard(participant)).join("");

            if (!matches.some((participant) => this.normalizeText(this.getParticipantLabel(participant)) === normalizedQuery || participant.passaporte === query || this.normalizeText(participant.nome) === normalizedQuery)) {
                container.innerHTML += this.renderManualParticipantCard(query);
            }

            emptyState.style.display = matches.length ? "none" : "block";
            this.applyStaggerAnimation(container, ".participant-card");
        },

        renderSellerSuggestions(filterText = "") {
            const container = this.dom["seller-action-list"];
            const emptyState = this.dom["seller-empty"];
            if (!container || !emptyState) return;

            const query = filterText.trim();

            if (!query) {
                container.innerHTML = "";
                emptyState.style.display = "none";
                return;
            }

            const matches = this.findParticipantMatches(query);
            container.innerHTML = matches.map((participant) => this.renderSellerCard(participant)).join("");

            emptyState.style.display = matches.length ? "none" : "block";
            this.applyStaggerAnimation(container, ".participant-card");
        },

        renderSellerCard(participant) {
            const value = this.getParticipantLabel(participant);
            const currentValue = this.dom["venda-vendedor"] ? this.dom["venda-vendedor"].value.trim() : "";
            const isActive = currentValue === value ? " active" : "";
            return `
                <button class="participant-card${isActive}" type="button" onclick="app.selectSeller('${this.escapeForSingleQuote(value)}')">
                    <div class="participant-card-main">
                        <strong>${participant.nome}</strong>
                        <span>Passaporte ${participant.passaporte}</span>
                    </div>
                    <span class="participant-card-tag">Usar</span>
                </button>
            `;
        },

        selectSeller(value, clearList = true) {
            const cleanValue = value.trim();
            if (!cleanValue || !this.dom["venda-vendedor"]) return;
            this.dom["venda-vendedor"].value = cleanValue;
            if (clearList && this.dom["seller-action-list"] && this.dom["seller-empty"]) {
                this.dom["seller-action-list"].innerHTML = "";
                this.dom["seller-empty"].style.display = "none";
            }
        },

        renderParticipantCard(participant) {
            const value = this.getParticipantLabel(participant);
            const isActive = this.state.selectedParticipantValue === value ? " active" : "";
            return `
                <button class="participant-card${isActive}" type="button" onclick="app.selectParticipant('${this.escapeForSingleQuote(value)}')">
                    <div class="participant-card-main">
                        <strong>${participant.nome}</strong>
                        <span>Passaporte ${participant.passaporte}</span>
                    </div>
                    <span class="participant-card-tag">Adicionar</span>
                </button>
            `;
        },

        renderManualParticipantCard(rawValue) {
            return `
                <button class="participant-card" type="button" onclick="app.selectParticipant('${this.escapeForSingleQuote(rawValue)}', true)">
                    <div class="participant-card-main">
                        <strong>${rawValue}</strong>
                        <span>Adicionar participante manualmente</span>
                    </div>
                    <span class="participant-card-tag">Manual</span>
                </button>
            `;
        },

        selectParticipant(value, isManual = false) {
            const cleanValue = value.trim();
            if (!cleanValue) return;
            this.state.selectedParticipantValue = cleanValue;
            if (this.dom["novo-participante"]) {
                this.dom["novo-participante"].value = cleanValue;
            }
            this.addParticipant(isManual ? cleanValue : cleanValue);
        },

        // --- FUNÇÃO CORAÇÃO DA MATEMÁTICA ---
        recalcItemMath(item) {
            const washType = WASH_TYPES[item.id];
            
            if (washType.type === "padrao") {
                let pMaq = washType.pMaq;
                let pCli = washType.pCli;

                // Lógica de Desconto: -5% Máquina, +5% Cliente (Sua comissão e Facção ficam intactos)
                if (this.state.discountOn) {
                    pMaq -= 0.05;
                    pCli += 0.05;
                }

                const lucroTotal = item.val * washType.pLuc;
                item.maq = item.val * pMaq;
                item.cliente = item.val * pCli;
                item.comissao_lav = lucroTotal * 0.30; 
                item.fac = lucroTotal * 0.70;          
                item.caixa = item.fac;
            } else {
                item.maq = item.val * 0.20;
                const resultado = item.val - item.maq;
                item.fac = 0;
                item.cliente = 0; 
                item.comissao_lav = resultado; 
                item.caixa = 0;
            }
            
            item.mats = Math.ceil((item.val / 100000) * 11);
        },

        toggleDiscount() {
            this.state.discountOn = !this.state.discountOn;
            const btn = document.getElementById('btn-toggle-desconto');
            const icon = document.getElementById('icone-desconto');
            const text = document.getElementById('texto-desconto');

            // Troca a aparência do botão com efeitos brilhosos
            if (this.state.discountOn) {
                if (btn) {
                    btn.style.borderColor = 'var(--success)';
                    btn.style.color = 'var(--success)';
                    btn.style.background = 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 100%)';
                    btn.style.boxShadow = '0 0 20px rgba(16,185,129,0.3)';
                    btn.style.textShadow = '0 0 10px rgba(16,185,129,0.5)';
                }
                if (icon) icon.innerText = '✅';
                if (text) text.innerText = 'LAVAGEM C/ DESCONTO: ON';
            } else {
                if (btn) {
                    btn.style.borderColor = 'var(--danger)';
                    btn.style.color = 'var(--danger)';
                    btn.style.background = 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)';
                    btn.style.boxShadow = '0 0 15px rgba(239,68,68,0.2)';
                    btn.style.textShadow = '0 0 10px rgba(239,68,68,0.5)';
                }
                if (icon) icon.innerText = '⭕';
                if (text) text.innerText = 'LAVAGEM C/ DESCONTO: OFF';
            }

            // Atualiza inputs da aba calculadora se tiver algo lá
            if (document.getElementById('w35-input')?.value) this.calcWash('35');
            if (document.getElementById('w40-input')?.value) this.calcWash('40');
            if (document.getElementById('wp-input')?.value) this.calcWash('pers');

            // ATUALIZA O CARRINHO AUTOMATICAMENTE
            if (this.state.cart.length > 0) {
                this.state.cart.forEach(item => this.recalcItemMath(item));
                this.renderCart();
                this.showToast(this.state.discountOn ? "Desconto aplicado ao carrinho!" : "Desconto removido do carrinho!", this.state.discountOn ? "success" : "error");
            }
        },

        maskCurrency(e) {
            let value = e.target.value.replace(/\D/g, "");
            if (value === "") {
                e.target.value = "";
                return;
            }
            e.target.value = parseInt(value, 10).toLocaleString("pt-BR");
        },

        getNumericValue(id) {
            const el = document.getElementById(id);
            if (!el || !el.value) return 0;
            const cleanStr = el.value.replace(/\./g, "").replace(",", ".");
            return parseFloat(cleanStr) || 0;
        },

        calcWash(type) {
            const formatMoney = (value) => "R$ " + value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const idPrefix = ["35", "40"].includes(type) ? `w${type}` : "wp";

            const value = this.getNumericValue(`${idPrefix}-input`);
            const mats = Math.ceil((value / 100000) * 11);
            const matsDisplay = document.getElementById(`${idPrefix}-mats`);
            if (matsDisplay) matsDisplay.innerText = `Materiais: ${mats} Papel | ${mats} Tinta`;

            if (["35", "40"].includes(type)) {
                const washType = WASH_TYPES[type];
                let pMaq = washType.pMaq;
                let pCli = washType.pCli;

                if (this.state.discountOn) {
                    pMaq -= 0.05;
                    pCli += 0.05;
                }

                const lucroTotal = value * washType.pLuc;
                const maq = value * pMaq;
                const cliente = value * pCli;
                const comissaoUser = lucroTotal * 0.30;
                const caixaFac = lucroTotal * 0.70;

                document.getElementById(`${idPrefix}-maq`).innerText = formatMoney(maq);
                document.getElementById(`${idPrefix}-luc`).innerText = formatMoney(lucroTotal);
                document.getElementById(`${idPrefix}-cax`).innerText = formatMoney(caixaFac);
                document.getElementById(`${idPrefix}-com`).innerText = formatMoney(comissaoUser);
                document.getElementById(`${idPrefix}-cli`).innerText = formatMoney(cliente);
            } else if (type === "pers") {
                const maq = value * 0.20;
                const resultado = value - maq;
                const seuLucro = resultado; 
                document.getElementById(`${idPrefix}-maq`).innerText = formatMoney(maq);
                document.getElementById(`${idPrefix}-res`).innerText = formatMoney(resultado);
                document.getElementById(`${idPrefix}-fac`).innerText = formatMoney(0);
                document.getElementById(`${idPrefix}-seu`).innerText = formatMoney(seuLucro);
            }
        },

        copyAdText(el) {
            navigator.clipboard.writeText(el.innerText).then(() => this.showToast("Copiado!"));
        },

        showToast(msg, type = "success") {
            const toast = document.createElement("div");
            toast.className = `toast ${type}`;
            toast.innerText = msg;
            this.dom["toast-container"].appendChild(toast);
            setTimeout(() => {
                toast.classList.add("closing");
                setTimeout(() => toast.remove(), 250);
            }, 2750);
        },

        applyStaggerAnimation(container, selector) {
            if (!container) return;
            const items = container.querySelectorAll(selector);
            if (!items.length) return;
            container.classList.add("stagger-list");
            items.forEach((item, index) => {
                item.style.animationDelay = `${Math.min(index * 45, 220)}ms`;
            });
        },

        formatDate(dateValue) {
            if (!dateValue) return "";
            const [year, month, day] = dateValue.split("-");
            return `${day}/${month}/${year}`;
        },

        renderCatalog() {
            let htmlBuffer = '<div class="grid-list-small">';
            Object.entries(WASH_TYPES).forEach(([id, item]) => {
                htmlBuffer += `
                    <div class="catalog-item" data-id="${id}" onclick="app.selectItem('${id}')">
                        <div class="cat-name">${item.name}</div>
                    </div>
                `;
            });
            htmlBuffer += "</div>";
            this.dom["sales-catalog"].innerHTML = htmlBuffer;
            this.applyStaggerAnimation(this.dom["sales-catalog"], ".catalog-item");
        },

        selectItem(id) {
            this.state.selectedItemId = id;
            document.querySelectorAll(".catalog-item").forEach((el) => el.classList.remove("selected"));
            document.querySelector(`.catalog-item[data-id="${id}"]`).classList.add("selected");
            this.dom["price-controls"].classList.remove("hidden-controls");
            this.dom["select-msg"].style.display = "none";
            this.dom["venda-valor"].value = "";
            this.dom["venda-valor"].focus();

            // CONVERSÃO AUTOMÁTICA DO CARRINHO PARA A NOVA OPÇÃO CLICADA
            if (this.state.cart.length > 0) {
                this.state.cart.forEach(item => {
                    item.id = id;
                    item.name = WASH_TYPES[id].name;
                    this.recalcItemMath(item);
                });
                this.renderCart();
                this.showToast(`Itens no carrinho alterados para ${WASH_TYPES[id].name}!`, "success");
            }
        },

        addToCart() {
            const id = this.state.selectedItemId;
            if (!id) return this.showToast("Selecione uma operação", "error");

            const val = this.getNumericValue("venda-valor");
            if (val <= 0) return this.showToast("Digite um valor válido", "error");

            const newItem = {
                id,
                name: WASH_TYPES[id].name,
                val,
                maq: 0,
                caixa: 0,
                comissao_lav: 0,
                cliente: 0,
                fac: 0,
                mats: 0
            };

            this.recalcItemMath(newItem);
            this.state.cart.push(newItem);

            this.dom["venda-valor"].value = "";
            this.renderCart();
            this.showToast("Lavagem adicionada!");
            this.dom["cart-production-area"].classList.add("hidden");
        },

        removeFromCart(idx) {
            this.state.cart.splice(idx, 1);
            this.renderCart();
            this.dom["cart-production-area"].classList.add("hidden");
        },

        clearCart() {
            this.state.cart = [];
            this.renderCart();
            this.dom["cart-production-area"].classList.add("hidden");
        },

        renderCart() {
            const container = this.dom["cart-items"];
            if (this.state.cart.length === 0) {
                container.innerHTML = '<p class="empty-msg">Nenhuma operação adicionada</p>';
                this.dom["cart-summary-area"].innerHTML = "";
                return;
            }

            let html = "";
            let totalSujo = 0;
            let totalLimpo = 0;
            let totalFac = 0;
            let totalMaq = 0;
            let totalUser = 0;

            this.state.cart.forEach((item, idx) => {
                totalSujo += item.val;
                totalLimpo += item.cliente;
                totalFac += item.fac;
                totalMaq += item.maq;
                totalUser += item.comissao_lav;
                html += `
                    <div class="cart-item">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="wash-val-sujo">Pegar (Sujo): R$ ${item.val.toLocaleString("pt-BR")}</div>
                        <div class="wash-val-limpo">Entregar (Limpo): R$ ${item.cliente.toLocaleString("pt-BR")}</div>
                        <div class="wash-val-yours">Sua Parte: R$ ${item.comissao_lav.toLocaleString("pt-BR")}</div>
                        <div class="btn-remove-item" onclick="app.removeFromCart(${idx})">&times;</div>
                    </div>
                `;
            });

            container.innerHTML = html;
            this.dom["cart-summary-area"].innerHTML = `
                <div class="cart-summary-box">
                    <div class="summary-total">Total Sujo: R$ ${totalSujo.toLocaleString("pt-BR")}</div>
                    <div style="color: #5eead4; font-weight: bold; margin-top: 5px;">Total a Entregar (Limpo): R$ ${totalLimpo.toLocaleString("pt-BR")}</div>
                    <div class="summary-yours">Sua Comissão Total: R$ ${totalUser.toLocaleString("pt-BR")}</div>
                    <div style="color: var(--success); font-size: 0.9rem; margin-top: 10px;">Caixa Facção: R$ ${totalFac.toLocaleString("pt-BR")}</div>
                    <div style="color: var(--danger); font-size: 0.8rem;">Máquina: R$ ${totalMaq.toLocaleString("pt-BR")}</div>
                </div>
            `;
        },

        calculateCartProduction() {
            if (this.state.cart.length === 0) return this.showToast("Carrinho vazio!", "error");

            let totalMats = 0;
            let detailsHTML = "";

            this.state.cart.forEach((item) => {
                totalMats += item.mats;
                detailsHTML += `
                    <div class="detail-card-small">
                        <div class="detail-header-small"><span class="detail-name">${item.name}</span></div>
                        <div class="mats-grid-small" style="margin-bottom: 8px;">
                            <div class="mat-item-tiny" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3);">
                                <span style="color:#fca5a5;">Pegar Sujo:</span> <b style="color:#fecaca;">R$ ${(item.val / 1000).toFixed(0)}k</b>
                            </div>
                            <div class="mat-item-tiny" style="background: rgba(96, 165, 250, 0.1); border: 1px solid rgba(96, 165, 250, 0.3);">
                                <span style="color:#93c5fd;">Dar Limpo:</span> <b style="color:#bfdbfe;">R$ ${(item.cliente / 1000).toFixed(0)}k</b>
                            </div>
                        </div>
                        <div class="mats-grid-small">
                            <div class="mat-item-tiny"><span>Papel:</span> <b>${item.mats}</b></div>
                            <div class="mat-item-tiny"><span>Tinta:</span> <b>${item.mats}</b></div>
                        </div>
                    </div>
                `;
            });

            this.dom["mats-list-display"].innerHTML = `
                <div class="mat-tag-pill"><span>Papel:</span> <b>${totalMats}</b></div>
                <div class="mat-tag-pill"><span>Tinta:</span> <b>${totalMats}</b></div>
            `;

            this.dom["sales-production-details"].innerHTML = detailsHTML;

            const area = this.dom["cart-production-area"];
            area.classList.remove("hidden");
            area.scrollIntoView({ behavior: "smooth" });
        },

        closeProduction() {
            this.dom["cart-production-area"].classList.add("hidden");
        },

        addParticipant(forcedValue = "") {
            const rawValue = forcedValue || this.dom["novo-participante"].value.trim();
            if (!rawValue) return;

            const normalizedRaw = this.normalizeText(rawValue);
            const matchedParticipant = PARTICIPANT_PRESETS.find((participant) => (
                participant.passaporte === rawValue
                || this.normalizeText(participant.nome) === normalizedRaw
                || this.normalizeText(this.getParticipantLabel(participant)) === normalizedRaw
            ));

            const finalValue = matchedParticipant ? this.getParticipantLabel(matchedParticipant) : rawValue;
            if (this.state.participants.has(finalValue)) {
                this.dom["novo-participante"].value = "";
                this.dom["participant-action-list"].innerHTML = "";
                this.dom["participant-empty"].style.display = "none";
                return;
            }

            this.state.participants.add(finalValue);
            this.renderParticipants();
            this.dom["novo-participante"].value = "";
            this.state.selectedParticipantValue = "";
            this.dom["participant-action-list"].innerHTML = "";
            this.dom["participant-empty"].style.display = "none";
        },

        removeParticipant(val) {
            this.state.participants.delete(val);
            this.renderParticipants();
        },

        renderParticipants() {
            let html = "";
            this.state.participants.forEach((participant) => {
                html += `<div class="chip">${participant} <span onclick="app.removeParticipant('${this.escapeForSingleQuote(participant)}')">&times;</span></div>`;
            });
            this.dom["lista-participantes"].innerHTML = html;
            this.applyStaggerAnimation(this.dom["lista-participantes"], ".chip");
        },

        handleEnterParticipant(e) {
            if (e.key === "Enter") this.addParticipant();
        },

        sendWebhook(url, payload) {
            try {
                fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            } catch (error) {
                console.error("Erro Discord", error);
            }
        },

        sendActionWebhook() {
            let tipo = this.state.selectedActionName || "";

            const dataInput = this.dom["acao-data"].value.trim();
            const hora = this.dom["acao-hora"].value.trim();
            const resultado = document.querySelector('input[name="resultado"]:checked')?.value;

            if (!tipo || !dataInput || !hora || !resultado) return this.showToast("Preencha todos os dados da ação!", "error");
            if (this.state.participants.size === 0) return this.showToast("Adicione pelo menos um participante!", "error");

            const dataFormatada = this.formatDate(dataInput);
            const participants = Array.from(this.state.participants).join("\n- ");
            const color = resultado === "Vitória" ? 3066993 : 15158332;

            const embedMainAcao = {
                username: "Zigos",
                embeds: [{
                    title: `Registro de Ação: ${tipo}`,
                    color,
                    fields: [
                        { name: "Resultado", value: `**${resultado.toUpperCase()}**`, inline: true },
                        { name: "Motivo", value: "Ação Blipada", inline: true },
                        { name: "Data/Hora", value: `${dataFormatada} às ${hora}`, inline: false },
                        { name: "Participantes", value: `- ${participants}` }
                    ]
                }]
            };

            this.showToast("Ação registrada com sucesso!");
            this.state.participants.clear();
            this.renderParticipants();
            this.pushRecentAction(tipo);

            this.sendWebhook(CONFIG.WEBHOOKS.ACOES, embedMainAcao);

            if (CONFIG.WEBHOOKS.LOGS_ACOES !== "NAO TEM") {
                this.sendWebhook(CONFIG.WEBHOOKS.LOGS_ACOES, {
                    username: "Zigos Log",
                    embeds: [{ color, description: `**Ação:** ${tipo}\n**Data:** ${dataFormatada}\n**Hora:** ${hora}\n**Resultado:** ${resultado}` }]
                });
            }
        },

        sendSaleWebhook() {
            const vendedor = this.dom["venda-vendedor"].value.trim();
            const faccao = this.dom["venda-faccao"].value.trim();
            const dataInput = this.dom["venda-data"].value.trim();
            const horaInput = this.dom["venda-hora"].value.trim();

            if (!vendedor || !faccao || !dataInput || !horaInput) return this.showToast("Preencha todos os campos!", "error");
            if (this.state.cart.length === 0) return this.showToast("O carrinho está vazio!", "error");

            let totalBruto = 0;
            let totalFac = 0;
            let totalMaq = 0;
            let totalCli = 0;
            let totalCom = 0;
            let totalMats = 0;

            const itensFormatados = this.state.cart.map((item) => {
                totalBruto += item.val;
                totalFac += item.fac;
                totalMaq += item.maq;
                totalCli += item.cliente;
                totalCom += item.comissao_lav;
                totalMats += item.mats;
                return `- ${item.name} | Valor: R$ ${item.val.toLocaleString("pt-BR")}`;
            }).join("\n");

            const currentColor = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
            const embedColor = parseInt(currentColor.replace("#", ""), 16) || 1076026;

            const embedVenda = {
                username: "Zigos",
                embeds: [{
                    title: "Lavagem Registrada",
                    color: embedColor,
                    fields: [
                        { name: "Lavador", value: vendedor, inline: true },
                        { name: "Cliente/Origem", value: faccao, inline: true },
                        { name: "Operações", value: itensFormatados, inline: false },
                        { name: "Pegou (Dinheiro Sujo)", value: `R$ ${totalBruto.toLocaleString("pt-BR")}`, inline: true },
                        { name: "Entregou (Limpo)", value: `R$ ${totalCli.toLocaleString("pt-BR")}`, inline: true },
                        { name: "Comissão Lavador", value: `**R$ ${totalCom.toLocaleString("pt-BR")}**`, inline: true },
                        { name: "Caixa (Facção)", value: `R$ ${totalFac.toLocaleString("pt-BR")}`, inline: true },
                        { name: "Máquina (Devolver)", value: `R$ ${totalMaq.toLocaleString("pt-BR")}`, inline: true },
                        { name: "Materiais Usados", value: `${totalMats} Papel | ${totalMats} Tinta`, inline: false }
                    ],
                    footer: { text: `Data: ${this.formatDate(dataInput)} às ${horaInput}` }
                }]
            };

            this.showToast("Registro enviado com sucesso!");
            this.clearCart();

            this.sendWebhook(CONFIG.WEBHOOKS.VENDAS, embedVenda);

            if (CONFIG.WEBHOOKS.LOGS_VENDAS !== "NAO TEM") {
                this.sendWebhook(CONFIG.WEBHOOKS.LOGS_VENDAS, {
                    username: "Zigos Log",
                    embeds: [{ color: embedColor, description: `**Cliente:** ${faccao}\n**Operações:**\n${itensFormatados}\n**Data:** ${this.formatDate(dataInput)} às ${horaInput}` }]
                });
            }
        }
    };

    document.addEventListener("DOMContentLoaded", () => window.app.init());
})();