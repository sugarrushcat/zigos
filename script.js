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
        '35': { name: "Lavagem 35%", type: "padrao", pMaq: 0.20, pLuc: 0.15, pCli: 0.65 },
        '40': { name: "Lavagem 40%", type: "padrao", pMaq: 0.20, pLuc: 0.20, pCli: 0.60 },
        'pers': { name: "Lavagem Pessoal", type: "pessoal" },
        'bau': { name: "Coisas do Baú", type: "pessoal" }
    };

    // =====================================================================
    // 📜 REGRAS DAS AÇÕES LIDA DO MANUAL OFICIAL
    // =====================================================================
    const ACTION_DETAILS = {
        "Banco Central": { 
            bandidos: "Obrigatório 10", policia: "Máximo 14", refens: "Máximo 5",
            armamento: "Somente Fuzil | 12: Máx 3",
            perimetro: "Máx 3 bandidos fora. Proibido bandidos fora se a ação for na fuga.",
            extras: "Negociação obrigatória (negociador não pode ser morto). Permitido 4 smokes e 3 gás.",
            cartao: "Cartão Azul", bgCartao: "#2563eb", textCartao: "#ffffff"
        },
        "Banco Fleeca": {
            bandidos: "Obrigatório 08", policia: "Máximo 10", refens: "Máximo 5",
            armamento: "Mínimo Submetralhadora | 12: 03",
            perimetro: "Life Invader: Máx 3 em prédios ou estac. / Praia: Teti-chão+Helidrone / Shopping: Máx 4 em prédios.",
            extras: "Mínimo de 3 bandidos dentro. Negociação obrigatória. Permitido 2 smokes e 2 gás.",
            cartao: "Cartão Azul", bgCartao: "#2563eb", textCartao: "#ffffff"
        },
        "Barbearia": {
            bandidos: "Mínimo 2, Máximo 4", policia: "Mesma quant. dos bandidos", refens: "Proibido",
            armamento: "Soco ou arma branca",
            perimetro: "Ação totalmente focada no local da barbearia.",
            extras: "Obrigatória a negociação. Proibido o uso de armas de fogo.",
            cartao: "Cartão Roxo", bgCartao: "#9333ea", textCartao: "#ffffff"
        },
        "Loja de Armamentos": {
            bandidos: "Obrigatório 2", policia: "Máximo 3", refens: "Sem reféns",
            armamento: "Apenas Pistolas (recomenda-se Fajuta)",
            perimetro: "Obr. todos dentro (exceto Life Invader/Central/China/Costureira, mas sem prédios).",
            extras: "Obrigatório negociação. Proibido marcar drop policial.",
            cartao: "Cartão Vermelho", bgCartao: "#dc2626", textCartao: "#ffffff"
        },
        "Loja de Departamento": {
            bandidos: "Obrigatório 4", policia: "Máximo 5", refens: "Obrigatório 1 refém",
            armamento: "Apenas Pistolas",
            perimetro: "Teti-Chão. Máximo de 2 bandidos fora da Loja.",
            extras: "Dois bandidos iniciais devem permanecer dentro. Fuga limitada a 2 carros.",
            cartao: "Cartão Verde", bgCartao: "#16a34a", textCartao: "#ffffff"
        },
        "Açougue": { 
            bandidos: "Obrigatório 8", policia: "Máximo 11", refens: "Proibido",
            armamento: "Somente submetralhadora",
            perimetro: "Proibido veículos dentro do perímetro. Liberada a rotação após o início.",
            extras: "Obrigatória a negociação. Permitido 2 smokes e 1 granada de gás.",
            cartao: "Cartão Rosa", bgCartao: "#ec4899", textCartao: "#ffffff"
        },
        "Loja Samir (Bebidas)": {
            bandidos: "Obrigatório 3", policia: "Máximo 4", refens: "Proibido",
            armamento: "Apenas Pistolas",
            perimetro: "Teti-Chão. Proibido subir em escadas e rampas. Proibido veículos dentro.",
            extras: "Obrigatória a negociação.",
            cartao: "Cartão Verde", bgCartao: "#16a34a", textCartao: "#ffffff"
        },
        "Atom": {
            bandidos: "Obrigatório 2", policia: "Máximo 3", refens: "Proibido",
            armamento: "Apenas Pistolas",
            perimetro: "Proibido colocar veículos dentro do perímetro. Liberada a rotação.",
            extras: "Obrigatória a negociação.",
            cartao: "Cartão Vermelho", bgCartao: "#dc2626", textCartao: "#ffffff"
        },
        "Planet": {
            bandidos: "Obrigatório 5", policia: "Máximo 7", refens: "Proibido",
            armamento: "Apenas Pistolas",
            perimetro: "Teti-Chão. Proibido subir nas escadas/rampas. Proibido veículos dentro.",
            extras: "Obrigatória a negociação.",
            cartao: "Cartão Verde", bgCartao: "#16a34a", textCartao: "#ffffff"
        },
        "Joalheria": {
            bandidos: "Obrigatório 7", policia: "Máximo 9", refens: "Máximo 5",
            armamento: "Somente submetralhadora | 12: 2",
            perimetro: "Sem Refém: Máx 2 fora. Proibido Metrô e prefeitura.",
            extras: "Negociador não pode ser morto. 2 smokes e 1 gás. Limite de 2 veículos na fuga.",
            cartao: "Pendrive", bgCartao: "#4b5563", textCartao: "#ffffff"
        },
        "Nióbio": {
            bandidos: "Obrigatório 12", policia: "Máximo 22", refens: "Proibido",
            armamento: "Somente Fuzil e Doze | 12: 2",
            perimetro: "Teti-Chão. Proibido bandidos atirando de fora da ação principal.",
            extras: "Negociação inexistente. Proibido ser feito na fuga. Permitido 4 smokes.",
            cartao: "Cartão Azul", bgCartao: "#2563eb", textCartao: "#ffffff"
        },
        "Ações de Rua (PvP)": {
            bandidos: "Sem limite definido", policia: "Sem limite definido", refens: "-",
            armamento: "Pequeno, médio e grande porte",
            perimetro: "Ações iniciadas na rua devem ser finalizadas na rua. Proibido fugir para safe zones.",
            extras: "Proibido retornar/cobrar após finalização. Proibido atirar do porta-malas."
        },
        "Fuga Limpa / Teti-Chão": {
            bandidos: "-", policia: "-", refens: "-",
            armamento: "Proibido Taser / Bala de Borracha na fuga a pé",
            perimetro: "Teti-Chão: Proibido subir em muros ou lugares inalcançáveis a pé.",
            extras: "Fuga Limpa: Sem QRR, sem pit, sem abastecer, sem bater de propósito. 1 troca de veículo."
        },
        "Corrida Ilegal": {
            bandidos: "1 Veículo cheio", policia: "Máximo 3 VTRs (+Heli)", refens: "Proibido",
            armamento: "Proibido armamento",
            perimetro: "Rotas de fuga e vias.",
            extras: "Fuga limpa, sem abastecer ou resgate."
        },
        "Boosting": {
            bandidos: "1 VTR Boosting + 1 Suporte (máx 4)", policia: "Máximo 4 VTRs (+Heli)", refens: "-",
            armamento: "Livre",
            perimetro: "Rotas abertas de fuga.",
            extras: "Em caso de disparos não existe limite de policiais."
        },
        "Roubo de Veículos / Porta-malas": {
            bandidos: "1 Veículo cheio", policia: "Máximo 3 VTRs", refens: "-",
            armamento: "Apenas armas brancas (sem cortantes)",
            perimetro: "Rotas de fuga.",
            extras: "Fuga Limpa. Proibido agarrar no H em fuga a pé."
        },
        "Recuperação de Veículo": {
            bandidos: "Mínimo 5 membros", policia: "-", refens: "-",
            armamento: "Livre",
            perimetro: "Local onde o veículo está guardado/sendo recuperado.",
            extras: "Ação visa apenas recuperar. Sem pedir ajuda e sem voltar após a morte."
        },
        "Mesa de Drogas": {
            bandidos: "Mínimo 5", policia: "Contingente máximo", refens: "Proibido",
            armamento: "Livre",
            perimetro: "Teti-chão. Proibido veículos dentro e sair da área.",
            extras: "Negociação inexistente. Proibido juntar facções."
        },
        "Tráfico de Drogas": {
            bandidos: "1 VTR (máx 4) + QRR", policia: "Máximo 3 VTRs (+Heli)", refens: "Proibido",
            armamento: "Livre (Se houver disparos, polícia sem limites)",
            perimetro: "Rotas abertas de acompanhamento.",
            extras: "Fuga limpa. Proibido cop bait e ajuda externa."
        },
        "ATM / Registradora / Residência": {
            bandidos: "1 Veículo (máx 4)", policia: "Máximo 3 VTRs", refens: "-",
            armamento: "Armas brancas (Sem cortantes)",
            perimetro: "Fuga aberta pelas vias.",
            extras: "Fuga limpa, sem levar pessoas no porta-malas."
        },
        "Caixa de correio": {
            bandidos: "1 Veículo cheio", policia: "Máximo 3 VTRs (+Heli)", refens: "-",
            armamento: "Armas brancas (Sem cortantes)",
            perimetro: "Fuga limpa.",
            extras: "Polícia tem acesso a Taser após 3 avisos na fuga a pé."
        },
        "Observatório": {
            bandidos: "Obrigatório 10", policia: "Máximo 14", refens: "Proibido",
            armamento: "Apenas Pistolas",
            perimetro: "Teti-chão. Proibido veículos dentro do perímetro. Rotação liberada.",
            extras: "Obrigatória a negociação.",
            cartao: "Cartão Verde", bgCartao: "#16a34a", textCartao: "#ffffff"
        },
        "Auditório": {
            bandidos: "Obrigatório 6", policia: "Máximo 8", refens: "Proibido",
            armamento: "Apenas Pistolas",
            perimetro: "Teti-chão. Proibido veículos dentro do perímetro. Rotação liberada.",
            extras: "Obrigatória a negociação.",
            cartao: "Cartão Verde", bgCartao: "#16a34a", textCartao: "#ffffff"
        },
        "Campo de Golf": {
            bandidos: "Obrigatório 6", policia: "Máximo 7", refens: "Proibido",
            armamento: "Apenas Pistolas",
            perimetro: "Teti-chão. Proibido escadas/rampa. Proibido veículos na área.",
            extras: "Obrigatória a negociação. Rotação liberada.",
            cartao: "Cartão Verde", bgCartao: "#16a34a", textCartao: "#ffffff"
        },
        "Mergulhador": {
            bandidos: "Obrigatório 6", policia: "Máximo 8", refens: "Proibido",
            armamento: "Apenas Pistolas",
            perimetro: "Teti-chão. Proibido escadas/rampa. Proibido veículos na área.",
            extras: "Obrigatória a negociação. Rotação liberada.",
            cartao: "Cartão Verde", bgCartao: "#16a34a", textCartao: "#ffffff"
        },
        "Helicrash": {
            bandidos: "Sem Limites", policia: "-", refens: "Proibido",
            armamento: "Escolhido no dia da ação",
            perimetro: "Disparos e combates devem acontecer DENTRO da zona vermelha. Proibido veículos lá dentro.",
            extras: "Não pode retornar após morrer e não pode cobrar a ação depois. Obrigatório roupa da facção."
        },
        "Sequestro / Refém / Negociação": {
            bandidos: "Sempre em maior número", policia: "Negociável", refens: "1 refém a cada 2 bandidos",
            armamento: "Livre",
            perimetro: "Definido pela ação de sequestro.",
            extras: "Proibido fingir que existe refém ou ser refém. Obrigatório algemas."
        },
        
        // --- AÇÕES FÉRIAS ---
        "Hotel Abandonado": {
            bandidos: "4", policia: "5", refens: "Sem reféns",
            armamento: "Pistola",
            perimetro: "Ocorrendo apenas no local designado do Hotel.",
            extras: "Ação de férias. Sem negociação e sem fugas."
        },
        "Cemitério": {
            bandidos: "Mínimo 6, Máximo 10", policia: "Mesma quantidade dos bandidos", refens: "-",
            armamento: "Arma branca",
            perimetro: "Área do Cemitério.",
            extras: "Ação de Férias.",
            cartao: "Cartão Roxo", bgCartao: "#9333ea", textCartao: "#ffffff"
        },
        "Motoclube": {
            bandidos: "Máximo 6", policia: "Máximo 8", refens: "-",
            armamento: "Pistola",
            perimetro: "Área do Motoclube.",
            extras: "Ação de Férias."
        },
        "Galinheiro": {
            bandidos: "10", policia: "14", refens: "Sem reféns",
            armamento: "Pistola",
            perimetro: "Permitido 4 bandidos fora da área principal.",
            extras: "Sem negociação e sem fugas. Permitido 3 smokes e 2 granadas de gás.",
            cartao: "Cartão Verde", bgCartao: "#16a34a", textCartao: "#ffffff"
        },
        "Madeireira": {
            bandidos: "8", policia: "11", refens: "Sem reféns",
            armamento: "Fuzil",
            perimetro: "Ação restrita à Madeireira.",
            extras: "Sem negociação e sem fugas. Permitido 3 smokes e 2 granadas de gás.",
            cartao: "Cartão Amarelo", bgCartao: "#eab308", textCartao: "#000000"
        },
        "Banco de Paleto": {
            bandidos: "12", policia: "Máximo 18", refens: "Máximo 6",
            armamento: "Somente Fuzil | 12: 2 (Polícia)",
            perimetro: "Obrigatório que pelo menos 6 fiquem dentro do banco.",
            extras: "Ação de Férias. Negociação Obrigatória. Permitido 6 smokes e 4 granadas de gás.",
            cartao: "Cartão Azul", bgCartao: "#2563eb", textCartao: "#ffffff"
        },
        "Aeroporto Abandonado": { 
            bandidos: "6", policia: "10", refens: "-",
            armamento: "Apenas Pistolas (PT)",
            perimetro: "Teti-Chão. Proibido veículos dentro do perímetro.",
            extras: "Ação de férias. Sem negociação. Permitido 2 smokes.",
            cartao: "Cartão Verde", bgCartao: "#16a34a", textCartao: "#ffffff"
        }
    };
    // =====================================================================

    window.app = {
        state: { participants: new Set(), cart: [], selectedItemId: null, isAdmin: false },
        dom: {},

        init() { this.cacheDOM(); this.setDefaults(); this.renderCatalog(); },

        cacheDOM() {
            const ids = [
                'acao-tipo', 'acao-tipo-custom', 'acao-data', 'acao-hora', 'novo-participante', 'lista-participantes',
                'venda-vendedor', 'venda-faccao', 'venda-data', 'venda-hora', 'venda-valor',
                'sales-catalog', 'price-controls', 'select-msg', 'cart-items', 'cart-summary-area',
                'cart-production-area', 'mats-list-display', 'sales-production-details',
                'toast-container', 'stat-total-vendas', 'stat-faturamento', 'stat-total-maq', 'stats-top-itens', 'stat-total-bruto',
                'filtro-inicio', 'filtro-fim'
            ];
            ids.forEach(id => this.dom[id] = document.getElementById(id));
        },

        setDefaults() {
            const now = new Date();
            const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
            const timeStr = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hour12: false }).format(now);

            ['acao', 'venda'].forEach(prefix => {
                if (this.dom[`${prefix}-data`]) this.dom[`${prefix}-data`].value = dateStr;
                if (this.dom[`${prefix}-hora`]) this.dom[`${prefix}-hora`].value = timeStr;
            });

            const firstDayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(now.getFullYear(), now.getMonth(), 1));
            if (this.dom['filtro-inicio']) this.dom['filtro-inicio'].value = firstDayStr;
            if (this.dom['filtro-fim']) this.dom['filtro-fim'].value = dateStr;
        },

        switchTab(tabId, event) {
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            if (event) event.currentTarget.classList.add('active');
            if (tabId === 'estatisticas' && this.state.isAdmin) this.loadDashboard();
        },

        renderActionRules(actionName, containerId) {
            const container = document.getElementById(containerId);
            if (!actionName || actionName === "Outro" || actionName === "") {
                container.classList.add('hidden');
                container.innerHTML = "";
                return;
            }

            const data = ACTION_DETAILS[actionName] || {
                bandidos: "-", policia: "-", refens: "-",
                armamento: "-", perimetro: "Não há registro de perímetro exato.", extras: "Consulte o manual da RUA2 no Discord."
            };

            let cartaoHtml = "";
            if (data.cartao && data.cartao.trim() !== "") {
                // Removida opacidade ou estilos complexos que poderiam quebrar no FiveM
                cartaoHtml = `
                <div style="margin-bottom: 15px; text-align: center;">
                    <span style="display: inline-block; padding: 8px 16px; border-radius: 4px; font-weight: bold; font-size: 14px; text-transform: uppercase; background-color: ${data.bgCartao}; color: ${data.textCartao}; border: 2px solid #ffffff;">
                        TIPO DE ACESSO: ${data.cartao}
                    </span>
                </div>`;
            }

            container.innerHTML = `
                ${cartaoHtml}
                <div class="rules-details-grid">
                    <div class="rule-box"><span class="rule-title">Bandidos</span> <span class="rule-val">${data.bandidos}</span></div>
                    <div class="rule-box"><span class="rule-title">Polícia</span> <span class="rule-val">${data.policia}</span></div>
                    <div class="rule-box"><span class="rule-title">Reféns</span> <span class="rule-val">${data.refens}</span></div>
                    <div class="rule-box"><span class="rule-title">Armamento</span> <span class="rule-val">${data.armamento}</span></div>
                </div>
                <div class="rule-full-box mt-10">
                    <span class="rule-title">Perímetro e Posições</span>
                    <p class="rule-text">${data.perimetro}</p>
                </div>
                <div class="rule-full-box mt-10">
                    <span class="rule-title">Regras Extras</span>
                    <p class="rule-text">${data.extras}</p>
                </div>
            `;
            container.classList.remove('hidden');
        },

        checkAcaoTipo() {
            const select = this.dom['acao-tipo'];
            const customInput = this.dom['acao-tipo-custom'];
            if (select && select.value === 'Outro') {
                customInput.classList.remove('hidden');
                customInput.focus();
            } else if (customInput) {
                customInput.classList.add('hidden');
            }
        },

        checkRegrasTipo() {
            const select = document.getElementById('regras-acao-tipo');
            if (select) {
                this.renderActionRules(select.value, 'acao-info-regras');
            }
        },

        maskCurrency(e) {
            let value = e.target.value.replace(/\D/g, ''); 
            if (value === "") {
                e.target.value = "";
                return;
            }
            e.target.value = parseInt(value, 10).toLocaleString('pt-BR');
        },

        getNumericValue(id) {
            let el = document.getElementById(id);
            if (!el || !el.value) return 0;
            let cleanStr = el.value.replace(/\./g, '').replace(',', '.');
            return parseFloat(cleanStr) || 0;
        },

        calcWash(type) {
            const f = (v) => "R$ " + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            let idPrefix = ['35','40'].includes(type) ? `w${type}` : (type === 'pers' ? 'wp' : 'wbau');
            
            let v = this.getNumericValue(`${idPrefix}-input`);

            let mats = Math.ceil((v / 100000) * 11);
            let matsDisplay = document.getElementById(`${idPrefix}-mats`);
            if (matsDisplay) matsDisplay.innerText = `Materiais: ${mats} Papel | ${mats} Tinta`;

            if (['35','40'].includes(type)) {
                let wt = WASH_TYPES[type];
                let lucroTotal = v * wt.pLuc;
                let comissaoUser = lucroTotal * 0.30;
                document.getElementById(`${idPrefix}-maq`).innerText = f(v * wt.pMaq);
                document.getElementById(`${idPrefix}-luc`).innerText = f(lucroTotal);
                document.getElementById(`${idPrefix}-cax`).innerText = f(lucroTotal * 0.70);
                document.getElementById(`${idPrefix}-com`).innerText = f(comissaoUser);
                document.getElementById(`${idPrefix}-cli`).innerText = f(v * wt.pCli);
            } else {
                let maq = v * 0.20; 
                let res = v - maq;
                let seuLucro = res * 0.70;
                document.getElementById(`${idPrefix}-maq`).innerText = f(maq);
                document.getElementById(`${idPrefix}-res`).innerText = f(res);
                document.getElementById(`${idPrefix}-fac`).innerText = f(res * 0.30);
                document.getElementById(`${idPrefix}-seu`).innerText = f(seuLucro);
            }
        },

        toggleAdmin() {
            if (this.state.isAdmin) return;
            this.state.isAdmin = true;
            this.showToast("Modo Admin Ativado!");
            const nav = document.getElementById('nav-menu');
            const btn = document.createElement('button');
            btn.className = 'nav-btn';
            btn.innerText = 'Estatísticas';
            btn.onclick = (e) => app.switchTab('estatisticas', e);
            nav.insertBefore(btn, nav.lastElementChild);
            this.loadDashboard();
        },

        copyAdText(el) { navigator.clipboard.writeText(el.innerText).then(() => this.showToast("Copiado!")); },

        showToast(msg, type = 'success') {
            const t = document.createElement('div');
            t.className = `toast ${type}`; t.innerText = msg;
            this.dom['toast-container'].appendChild(t);
            setTimeout(() => t.remove(), 3000);
        },

        formatDate(d) {
            if (!d) return '';
            const [y, m, d2] = d.split('-'); return `${d2}/${m}/${y}`;
        },

        renderCatalog() {
            let htmlBuffer = `<div class="grid-list-small">`;
            Object.entries(WASH_TYPES).forEach(([id, item]) => {
                htmlBuffer += `
                <div class="catalog-item" data-id="${id}" onclick="app.selectItem('${id}')">
                    <div class="cat-name">${item.name}</div>
                </div>`;
            });
            htmlBuffer += `</div>`;
            this.dom['sales-catalog'].innerHTML = htmlBuffer;
        },

        selectItem(id) {
            this.state.selectedItemId = id;
            document.querySelectorAll('.catalog-item').forEach(el => el.classList.remove('selected'));
            document.querySelector(`.catalog-item[data-id="${id}"]`).classList.add('selected');
            this.dom['price-controls'].classList.remove('hidden-controls');
            this.dom['select-msg'].style.display = 'none';
            this.dom['venda-valor'].value = "";
            this.dom['venda-valor'].focus();
        },

        addToCart() {
            const id = this.state.selectedItemId;
            if (!id) return this.showToast('Selecione uma operação', 'error');
            
            const val = this.getNumericValue('venda-valor');
            if (val <= 0) return this.showToast('Digite um valor válido', 'error');
            
            const wt = WASH_TYPES[id];
            let maq = 0, lucro = 0, caixa = 0, comissao_lav = 0, cliente = 0, fac = 0;

            if (wt.type === 'padrao') {
                maq = val * wt.pMaq;
                lucro = val * wt.pLuc;
                caixa = lucro * 0.70;
                comissao_lav = lucro * 0.30;
                cliente = val * wt.pCli;
                fac = caixa; 
            } else {
                maq = val * 0.20; 
                let res = val - maq;
                fac = res * 0.30;
                cliente = res * 0.70;
                comissao_lav = cliente;
                caixa = fac; 
            }

            let mats = Math.ceil((val / 100000) * 11);

            this.state.cart.push({
                id, name: wt.name, val, maq, caixa, comissao_lav, cliente, fac, mats
            });
            
            this.dom['venda-valor'].value = "";
            this.renderCart();
            this.showToast('Lavagem adicionada!');
            this.dom['cart-production-area'].classList.add('hidden');
        },

        removeFromCart(idx) {
            this.state.cart.splice(idx, 1);
            this.renderCart();
            this.dom['cart-production-area'].classList.add('hidden');
        },

        clearCart() {
            this.state.cart = [];
            this.renderCart();
            this.dom['cart-production-area'].classList.add('hidden');
        },

        renderCart() {
            const container = this.dom['cart-items'];
            if (this.state.cart.length === 0) {
                container.innerHTML = '<p class="empty-msg">Nenhuma operação adicionada</p>';
                this.dom['cart-summary-area'].innerHTML = '';
                return;
            }

            let html = '', totalSujo = 0, totalLimpo = 0, totalFac = 0, totalMaq = 0, totalUser = 0;
            this.state.cart.forEach((item, idx) => {
                totalSujo += item.val; totalLimpo += item.cliente;
                totalFac += item.fac; totalMaq += item.maq; totalUser += item.comissao_lav;
                html += `
                <div class="cart-item">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="wash-val-sujo">Pegar (Sujo): R$ ${item.val.toLocaleString('pt-BR')}</div>
                    <div class="wash-val-limpo">Entregar (Limpo): R$ ${item.cliente.toLocaleString('pt-BR')}</div>
                    <div class="wash-val-yours">Sua Parte: R$ ${item.comissao_lav.toLocaleString('pt-BR')}</div>
                    <div class="btn-remove-item" onclick="app.removeFromCart(${idx})">&times;</div>
                </div>`;
            });

            container.innerHTML = html;
            this.dom['cart-summary-area'].innerHTML = `
            <div class="cart-summary-box">
                <div class="summary-total">Total Sujo: R$ ${totalSujo.toLocaleString('pt-BR')}</div>
                <div style="color: #5eead4; font-weight: bold; margin-top: 5px;">Total a Entregar (Limpo): R$ ${totalLimpo.toLocaleString('pt-BR')}</div>
                <div class="summary-yours">Sua Comissão Total: R$ ${totalUser.toLocaleString('pt-BR')}</div>
                <div style="color: var(--success); font-size: 0.9rem; margin-top: 10px;">Caixa Facção: R$ ${totalFac.toLocaleString('pt-BR')}</div>
                <div style="color: var(--danger); font-size: 0.8rem;">Máquina: R$ ${totalMaq.toLocaleString('pt-BR')}</div>
            </div>`;
        },

        calculateCartProduction() {
            if (this.state.cart.length === 0) return this.showToast('Carrinho vazio!', 'error');
            
            let totalMats = 0, detailsHTML = "";

            this.state.cart.forEach(item => {
                totalMats += item.mats;
                detailsHTML += `
                <div class="detail-card-small">
                    <div class="detail-header-small"><span class="detail-name">${item.name}</span></div>
                    <div class="mats-grid-small" style="margin-bottom: 8px;">
                        <div class="mat-item-tiny" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3);">
                            <span style="color:#fca5a5;">Pegar Sujo:</span> <b style="color:#fecaca;">R$ ${(item.val/1000).toFixed(0)}k</b>
                        </div>
                        <div class="mat-item-tiny" style="background: rgba(96, 165, 250, 0.1); border: 1px solid rgba(96, 165, 250, 0.3);">
                            <span style="color:#93c5fd;">Dar Limpo:</span> <b style="color:#bfdbfe;">R$ ${(item.cliente/1000).toFixed(0)}k</b>
                        </div>
                    </div>
                    <div class="mats-grid-small">
                        <div class="mat-item-tiny"><span>Papel:</span> <b>${item.mats}</b></div>
                        <div class="mat-item-tiny"><span>Tinta:</span> <b>${item.mats}</b></div>
                    </div>
                </div>`;
            });

            let matsHtml = `
                <div class="mat-tag-pill"><span>Papel:</span> <b>${totalMats}</b></div>
                <div class="mat-tag-pill"><span>Tinta:</span> <b>${totalMats}</b></div>
            `;

            this.dom['mats-list-display'].innerHTML = matsHtml;
            this.dom['sales-production-details'].innerHTML = detailsHTML;

            const area = this.dom['cart-production-area'];
            area.classList.remove('hidden');
            area.scrollIntoView({ behavior: 'smooth' });
        },

        closeProduction() { this.dom['cart-production-area'].classList.add('hidden'); },

        addParticipant() {
            const val = this.dom['novo-participante'].value.trim();
            if (!val || this.state.participants.has(val)) return;
            this.state.participants.add(val);
            this.renderParticipants();
            this.dom['novo-participante'].value = "";
        },
        removeParticipant(val) { this.state.participants.delete(val); this.renderParticipants(); },
        renderParticipants() {
            let html = '';
            this.state.participants.forEach(p => html += `<div class="chip">${p} <span onclick="app.removeParticipant('${p}')">&times;</span></div>`);
            this.dom['lista-participantes'].innerHTML = html;
        },
        handleEnterParticipant(e) { if (e.key === 'Enter') this.addParticipant(); },

        sendWebhook(url, payload) {
            try {
                fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            } catch (e) {
                console.error("Erro Discord", e);
            }
        },

        sendActionWebhook() {
            let tipo = this.dom['acao-tipo'].value;
            if (tipo === 'Outro') {
                tipo = this.dom['acao-tipo-custom'].value.trim();
            } else {
                tipo = tipo.trim();
            }

            const dataF_input = this.dom['acao-data'].value.trim();
            const hora = this.dom['acao-hora'].value.trim();
            const resultado = document.querySelector('input[name="resultado"]:checked')?.value;

            if (!tipo || !dataF_input || !hora || !resultado) return this.showToast("Preencha todos os dados da ação!", "error");
            if (this.state.participants.size === 0) return this.showToast("Adicione pelo menos um participante!", "error");

            const dataF = this.formatDate(dataF_input);
            const parts = Array.from(this.state.participants).join('\n- ');
            const color = resultado === 'Vitória' ? 3066993 : 15158332;

            const embedMainAcao = {
                username: "Zigos",
                embeds: [{
                    title: `Registro de Ação: ${tipo}`, color: color,
                    fields: [
                        { name: "Resultado", value: `**${resultado.toUpperCase()}**`, inline: true },
                        { name: "Motivo", value: "Ação Blipada", inline: true },
                        { name: "Data/Hora", value: `${dataF} às ${hora}`, inline: false },
                        { name: "Participantes", value: `- ${parts}` }
                    ]
                }]
            };

            this.showToast("Ação registrada com sucesso!");
            this.state.participants.clear(); 
            this.renderParticipants();

            this.sendWebhook(CONFIG.WEBHOOKS.ACOES, embedMainAcao);

            if (CONFIG.WEBHOOKS.LOGS_ACOES !== "NAO TEM") {
                this.sendWebhook(CONFIG.WEBHOOKS.LOGS_ACOES, {
                    username: "Zigos Log", embeds: [{ color: color, description: `**Ação:** ${tipo}\n**Data:** ${dataF}\n**Hora:** ${hora}\n**Resultado:** ${resultado}` }]
                });
            }
        },

        sendSaleWebhook() {
            const vendedor = this.dom['venda-vendedor'].value.trim();
            const faccao = this.dom['venda-faccao'].value.trim();
            const dataInput = this.dom['venda-data'].value.trim();
            const horaInput = this.dom['venda-hora'].value.trim();

            if (!vendedor || !faccao || !dataInput || !horaInput) return this.showToast("Preencha todos os campos!", "error");
            if (this.state.cart.length === 0) return this.showToast('O carrinho está vazio!', 'error');
            
            let totalBruto = 0, totalFac = 0, totalMaq = 0, totalCli = 0, totalCom = 0, totalMats = 0;
            
            const itensFormatados = this.state.cart.map(i => {
                totalBruto += i.val; totalFac += i.fac; totalMaq += i.maq; 
                totalCli += i.cliente; totalCom += i.comissao_lav; totalMats += i.mats;
                return `- ${i.name} | Valor: R$ ${i.val.toLocaleString('pt-BR')}`;
            }).join('\n');

            const embedVenda = {
                username: "Zigos",
                embeds: [{
                    title: "Lavagem Registrada", color: 1076026,
                    fields: [
                        { name: "Lavador", value: vendedor, inline: true },
                        { name: "Cliente/Origem", value: faccao, inline: true },
                        { name: "Operações", value: itensFormatados, inline: false },
                        { name: "Pegou (Dinheiro Sujo)", value: `R$ ${totalBruto.toLocaleString('pt-BR')}`, inline: true },
                        { name: "Entregou (Limpo)", value: `R$ ${totalCli.toLocaleString('pt-BR')}`, inline: true },
                        { name: "Comissão Lavador", value: `**R$ ${totalCom.toLocaleString('pt-BR')}**`, inline: true },
                        { name: "Caixa (Facção)", value: `R$ ${totalFac.toLocaleString('pt-BR')}`, inline: true },
                        { name: "Máquina (Devolver)", value: `R$ ${totalMaq.toLocaleString('pt-BR')}`, inline: true },
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
                    username: "Zigos Log", embeds: [{ color: 1076026, description: `**Cliente:** ${faccao}\n**Operações:**\n${itensFormatados}\n**Data:** ${this.formatDate(dataInput)} às ${horaInput}` }]
                });
            }
        }, 

        loadDashboard() {
            this.dom['stats-top-itens'].innerHTML = '<p class="text-muted italic text-center">Dashboard desativado (Sistema operando sem Banco de Dados).</p>';
        }
    };

    document.addEventListener('DOMContentLoaded', () => window.app.init());
})();
