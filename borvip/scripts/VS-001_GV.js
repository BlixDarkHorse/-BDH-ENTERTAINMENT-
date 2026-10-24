/**
 * =========================================================================
 * GALAXY VYOLETA VS-001 — MOTOR DE CHAT & AUTENTICACIÓN INICIAL
 * UNIVERSO BDH - BLAZAR ON READY
 * =========================================================================
 */
(function() {
    const gxContainer   = document.getElementById('gx-chat-container');
    const gxWindow      = document.getElementById('gx-window');
    const btnMin        = document.getElementById('gx-minimize');
    const chatBody      = document.getElementById('gx-chat-body');
    const inputText     = document.getElementById('gx-input-text');
    const btnSend       = document.getElementById('gx-btn-send');
    const bkingPanel    = document.getElementById('gx-bking-panel');
    const tokenPreview  = document.getElementById('gx-token-preview');

    let selectedToken = null;
    let loginState = 0; // 0: clave/alias, 1: confirmar, 2: logueado
    let accessCode = '';
    const currentUserStr = localStorage.getItem('bdhActiveUser');

    function addMsg(html, type, isTyping = false) {
        const d = document.createElement('div');
        d.className = type === 'user' ? 'gx-msg-user' : 'gx-msg-bot';
        if (isTyping) d.classList.add('gx-typing');
        d.innerHTML = html;
        const id = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2,4);
        d.id = id;
        if (chatBody) { 
            chatBody.appendChild(d); 
            chatBody.scrollTop = chatBody.scrollHeight; 
        }
        return id;
    }

    function updateMsg(id, html) {
        const d = document.getElementById(id);
        if (d) { 
            d.innerHTML = html; 
            d.classList.remove('gx-typing'); 
            if (chatBody) chatBody.scrollTop = chatBody.scrollHeight; 
        }
    }

    // BLINDAJE INMUTABLE DEL FONDO VÍA JAVASCRIPT
    function blindarFondo() {
        try {
            if (document.body) {
                document.body.style.setProperty('background-attachment', 'fixed', 'important');
                document.body.style.setProperty('background-repeat', 'no-repeat', 'important');
                document.body.style.setProperty('background-size', 'cover', 'important');
                document.body.style.setProperty('background-position', 'center center', 'important');
            }
            if (document.documentElement) {
                document.documentElement.style.setProperty('scrollbar-gutter', 'stable', 'important');
            }
        } catch(e) {}
    }
    blindarFondo();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', blindarFondo);
    }

    function cerrarChatYEntrar(identidad) {
        setTimeout(() => {
            if (gxContainer) gxContainer.classList.remove('chat-overlay-mode');
            if (gxWindow) gxWindow.classList.add('gx-hidden');
            blindarFondo();
            const bubble = document.getElementById('gx-bubble');
            if (bubble) bubble.classList.remove('gx-hidden');
            if (typeof window.actualizarCronometro === 'function') window.actualizarCronometro();
            if (typeof window.actualizarInterfazPerfil === 'function') window.actualizarInterfazPerfil(identidad, true);
        }, 1200);
    }

    // -------------------------------------------------------
    // ESTADO INICIAL
    // -------------------------------------------------------
    let sesionValida = false;
    let currentAlias = 'USUARIO';
    if (currentUserStr) {
        try {
            const uData = JSON.parse(currentUserStr);
            currentAlias = uData.alias || 'USUARIO';
            const expTime = parseInt(localStorage.getItem('bdh_vip_exp')) || 0;
            if (expTime > Date.now()) {
                sesionValida = true;
            } else {
                localStorage.removeItem('bdhActiveUser');
                localStorage.removeItem('bdh_vip_identity');
            }
        } catch(e) {
            localStorage.removeItem('bdhActiveUser');
            localStorage.removeItem('bdh_vip_identity');
        }
    }

    if (!sesionValida) {
        loginState = 0;
        // NO LOGUEADO: EL CHAT SALE AL INICIO EN OVERLAY TOTAL
        if (gxContainer) gxContainer.classList.add('chat-overlay-mode');
        if (gxWindow) gxWindow.classList.remove('gx-hidden');
        if (chatBody) chatBody.innerHTML = '';
        addMsg(
            `AQUÍ GALAXY VYOLETA, VS-001.<br>` +
            `INGRESA TU CLAVE ÚNICA, ALIAS O ARRASTRA TU IMAGEN PARA EL ENLACE 😏🔥🌸<br><br>` +
            `<i>Ingresa tu credencial para acceder al Imperio Universo BDH.</i>`,
            'bot'
        );
        // El overlay .chat-overlay-mode ya usa position:fixed inset:0, no necesitamos overflow:hidden
        // (que desplazaría el viewport y haría saltar el fondo)
        const bubble = document.getElementById('gx-bubble');
        if (bubble) bubble.classList.add('gx-hidden');
    } else {
        // YA LOGUEADO
        loginState = 2;
        if (gxContainer) gxContainer.classList.remove('chat-overlay-mode');
        if (gxWindow) gxWindow.classList.add('gx-hidden');
        blindarFondo();
        const bubble = document.getElementById('gx-bubble');
        if (bubble) bubble.classList.remove('gx-hidden');

        if (typeof window.actualizarCronometro === 'function') window.actualizarCronometro();
        if (typeof window.actualizarInterfazPerfil === 'function') window.actualizarInterfazPerfil(currentAlias, true);
    }

    // -------------------------------------------------------
    // DRAG & DROP DE IMAGEN (TARJETA VIRTUAL / CLAVE VISUAL)
    // -------------------------------------------------------
    if (gxWindow) {
        gxWindow.addEventListener('dragover', (e) => { e.preventDefault(); gxWindow.classList.add('dragover'); });
        gxWindow.addEventListener('dragleave', (e) => { e.preventDefault(); gxWindow.classList.remove('dragover'); });
        gxWindow.addEventListener('drop', (e) => {
            e.preventDefault();
            gxWindow.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                const typingId = addMsg('📡 Escaneando tarjeta visual o imagen de llave...', 'bot', true);
                setTimeout(() => {
                    const idOficial = 'LORD_BDH_' + Math.floor(Math.random()*9000+1000) + '@🔥🌸.gms';
                    
                    // --- MATEMÁTICA DE ADICIÓN INYECTADA ---
                    let tiempo_actual = Date.now();
                    let exp_guardada = parseInt(localStorage.getItem('bdh_vip_exp')) || 0;
                    let recarga_ms = 30 * 86400000; // 30 días en milisegundos
                    let nueva_expMs = (exp_guardada > tiempo_actual) ? (exp_guardada + recarga_ms) : (tiempo_actual + recarga_ms);

                    localStorage.setItem('bdh_vip_exp', nueva_expMs.toString());
                    localStorage.setItem('bdh_vip_identity', idOficial);
                    localStorage.setItem('bdhActiveUser', JSON.stringify({ alias: idOficial, token: '🔑', stars: 1500, vip: true }));
                    
                    updateMsg(typingId, `Análisis biométrico exitoso.<br>Identidad verificada: <b style="color:var(--gx-gold)">${idOficial}</b>.<br>Desbloqueando Universo BDH...`);
                    loginState = 2;
                    cerrarChatYEntrar(idOficial);
                }, 1500);
            }
        });
    }

    // -------------------------------------------------------
    // TOKENS EMOJI BKING
    // -------------------------------------------------------
    const bkingTokens = [
        "🔥", "🌸", "🕷", "🕸", "☠", "♟", "🩸", "🍃", "🐼", "😹", "🧠", "👻", "👽", "⚔", "🐎", "🤖", 
        "📌", "📡", "🗡", "📦", "🧰", "🏧", "🎯", "🍱", "🖤", "🚀", "♠", "🛸", "🏞", "🌹", "👑", "👗", 
        "🐉", "💀", "🤫", "📚", "✨", "👹", "😎", "🐍", "🎻", "💞", "🛡️", "🧬", "🧿", "🪓", "🦾", "🦇"
    ];

    if (bkingPanel) {
        bkingTokens.forEach(token => {
            const el = document.createElement('div');
            el.className = 'gx-emoji';
            el.textContent = token;
            el.onclick = () => {
                document.querySelectorAll('.gx-emoji').forEach(e => e.classList.remove('selected'));
                el.classList.add('selected');
                selectedToken = token;
                if (tokenPreview) tokenPreview.textContent = token;
            };
            bkingPanel.appendChild(el);
        });
    }

    // -------------------------------------------------------
    // PROCESAMIENTO DE MENSAJES & ACCESO CON SEGURIDAD ESTRICTA
    // -------------------------------------------------------
    async function procesarMensajeIA() {
        const inputVal = inputText ? inputText.value.trim() : '';
        if (!inputVal) return;

        const displayMsg = selectedToken ? `[${selectedToken}] ${inputVal}` : inputVal;
        addMsg(displayMsg, 'user');
        if (inputText) inputText.value = '';
        if (tokenPreview) tokenPreview.textContent = '❓';
        document.querySelectorAll('.gx-emoji').forEach(e => e.classList.remove('selected'));
        const tokenActivo = selectedToken;
        selectedToken = null;

        const typingId = addMsg('📡 Verificando credenciales en el Núcleo BDH...', 'bot', true);

        setTimeout(async () => {
            if (loginState !== 2) {
                // FLUJO DE INGRESO: Valida alias, clave única o credencial de élite
                let finalIdentity = inputVal;
                if (!finalIdentity.includes('@')) {
                    finalIdentity = `${finalIdentity}@🔥🌸.gms`;
                }

                // Cálculo de tiempo: PRESERVAR si aún vigente, asignar 30 días solo si está vencido
                let tiempo_actual = Date.now();
                let exp_guardada = parseInt(localStorage.getItem('bdh_vip_exp')) || 0;
                let recarga_ms = 30 * 86400000;
                // ⚠️ LOGIN normal: NO suma 30 días si ya tiene tiempo vigente
                let expMs = (exp_guardada > tiempo_actual) ? exp_guardada : (tiempo_actual + recarga_ms);
                
                let accesoAutorizado = false;
                let welcomeMsg = '✅ <b>ACCESO CONCEDIDO</b>';

                // 1. Comando Maestro Bare Metal "BDH"
                if (inputVal.trim().toUpperCase() === 'BDH') {
                    finalIdentity = 'LORD_BDH';
                    welcomeMsg = '✅ <b>¡BIENVENIDO LORD BDH! ACCESO TOTAL CONCEDIDO</b>';
                    accesoAutorizado = true;
                } else {
                    // 2. Consulta de validación con API Azure
                    try {
                        let deviceId = localStorage.getItem('bdh_device_id') || ('DEV-' + Math.random().toString(36).substr(2,16));
                        localStorage.setItem('bdh_device_id', deviceId);

                        const res = await fetch('https://bdh-auth-core-f4gka6hua8bqe3bb.eastus-01.azurewebsites.net/api/authvip', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ usuario: inputVal, codigo_vip: '', device_id: deviceId })
                        }).catch(() => null);

                        if (res && res.ok) {
                            const data = await res.json();
                            if (data.identidad) finalIdentity = data.identidad;
                            if (data.expiracion) {
                                const sExp = new Date(data.expiracion).getTime();
                                if (sExp > expMs) expMs = sExp;
                            }
                            if (data.mensaje) welcomeMsg = `✅ <b>${data.mensaje}</b>`;
                            accesoAutorizado = true;
                        }
                    } catch(e) {
                        accesoAutorizado = false;
                    }
                }

                if (!accesoAutorizado) {
                    // RECHAZO TOTAL: No forja credenciales, mantiene bloqueo
                    updateMsg(typingId, '❌ <b>ACCESO DENEGADO</b><br>Credencial no autorizada o caducada. Ingresa tu alias VIP, clave única o comando válido para desbloquear el portal.');
                    loginState = 0;
                    return;
                }

                // Guardar sesión activa VIP SOLO SI FUE AUTORIZADO
                localStorage.setItem('bdh_vip_exp', expMs.toString());
                localStorage.setItem('bdh_vip_identity', finalIdentity);
                localStorage.setItem('bdhActiveUser', JSON.stringify({ alias: finalIdentity, token: tokenActivo || '🕸', stars: 1500, vip: true }));

                updateMsg(typingId, `${welcomeMsg}<br>Identidad oficial: <b style="color:var(--gx-gold)">${finalIdentity}</b>.<br>Iniciando ecosistema Universo BDH...`);
                loginState = 2;
                cerrarChatYEntrar(finalIdentity);
            } else {
                // Usuario ya conectado
                if (tokenActivo) {
                    updateMsg(typingId, `Comando recibido.<br>Matriz <b>${tokenActivo}</b> enlazada.`);
                } else {
                    updateMsg(typingId, `Directiva recibida, <b>${inputVal}</b>.<br>Ecosistema Universo BDH sincronizado.`);
                }
            }
        }, 1000);
    }

    if (btnSend) btnSend.addEventListener('click', procesarMensajeIA);
    if (inputText) inputText.addEventListener('keypress', (e) => { if (e.key === 'Enter') procesarMensajeIA(); });

    // Minimizar / Cerrar Chat: PROTEGIDO CONTRA INTRUSOS
    if (btnMin) {
        btnMin.addEventListener('click', () => {
            const expTime = parseInt(localStorage.getItem('bdh_vip_exp')) || 0;
            const hasUser = localStorage.getItem('bdhActiveUser');
            if (!hasUser || expTime <= Date.now()) {
                addMsg('⚠️ <b>ACCESO BLOQUEADO</b><br>Debes autenticarte en Galaxy Vyoleta para acceder al Universo BDH.', 'bot');
                return;
            }
            if (gxContainer) gxContainer.classList.remove('chat-overlay-mode');
            if (gxWindow) gxWindow.classList.add('gx-hidden');
            blindarFondo();
            const bubble = document.getElementById('gx-bubble');
            if (bubble) bubble.classList.remove('gx-hidden');
        });
    }

    const bubble = document.getElementById('gx-bubble');
    if (bubble) {
        bubble.addEventListener('click', () => {
            if (gxWindow) gxWindow.classList.toggle('gx-hidden');
        });
    }

    window.toggleGxChat = function(forceOpen) {
        if (forceOpen) {
            if (gxWindow) gxWindow.classList.remove('gx-hidden');
            if (gxContainer) {
                const expTime = parseInt(localStorage.getItem('bdh_vip_exp')) || 0;
                const hasUser = localStorage.getItem('bdhActiveUser');
                if (!hasUser || expTime <= Date.now()) {
                    gxContainer.classList.add('chat-overlay-mode');
                    // Sin overflow:hidden — el overlay usa position:fixed y no mueve el fondo
                }
            }
        } else {
            const expTime = parseInt(localStorage.getItem('bdh_vip_exp')) || 0;
            const hasUser = localStorage.getItem('bdhActiveUser');
            if ((!hasUser || expTime <= Date.now()) && gxWindow && !gxWindow.classList.contains('gx-hidden')) {
                addMsg('⚠️ <b>ACCESO BLOQUEADO</b><br>Debes autenticarte en Galaxy Vyoleta para acceder al Universo BDH.', 'bot');
                return;
            }
            if (gxWindow) gxWindow.classList.toggle('gx-hidden');
        }
    };
})();