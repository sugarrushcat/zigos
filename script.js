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

        // --- CONTROLA O CAMPO DA AÇÃO CUSTOMIZADA ---
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
            // Se o usuário selecionou 'Outro', pega o valor da caixinha escondida
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
