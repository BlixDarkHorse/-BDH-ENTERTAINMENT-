/**
 * BLAZAR ON READY - KEPPLER ENGINE WEB (Ojo de Kilrog)
 * Librería de Reproducción Vanilla JS - Build: Black Hole Edition
 */
class BlazarPlayer {
    constructor(containerSelector, videoSrc) {
        this.container = document.querySelector(containerSelector);
        this.videoSrc = videoSrc;

        this.init();
    }

    init() {
        // 1. Construye el cascarón HTML
        this.renderUI();

        // 2. Captura los elementos
        this.video = this.container.querySelector('video');
        this.progressBar = this.container.querySelector('.blazar-progress');
        this.btnPlay = this.container.querySelector('.btn-play');
        this.shield = this.container.querySelector('.anti-piracy-shield');

        // 3. ENRUTADOR BIFURCADO FÁCTICO CON INTERCEPTOR DE HARDWARE (XHR)
        if (this.videoSrc.includes('.m3u8')) {
            // 1. Aislamiento matemático del SAS Token y URL Base
            const partesUrl = this.videoSrc.split('?');
            const baseUrl = partesUrl[0].substring(0, partesUrl[0].lastIndexOf('/') + 1);
            const sasToken = partesUrl.slice(1).join('?');

            if (typeof Hls !== 'undefined' && Hls.isSupported()) {

                // 2. Interceptor XHR Nativo (Sobrescribe la red en el Hilo Principal)
                const hls = new Hls({
                    debug: false,
                    xhrSetup: function (xhr, url) {
                        let newUrl = url;

                        // A. Aniquilación de URLs Fantasma y Remapeo de Archivos
                        // FFmpeg grabó 'example.com', redirigimos al Blob real y al nombre exacto del archivo
                        if (newUrl.includes('example.com/keys/audio_spa_1.key')) {
                            newUrl = baseUrl + 'audio_spa_1/audio_spa_1_aes.key';
                        } else if (newUrl.includes('example.com/keys/audio_eng_2.key')) {
                            newUrl = baseUrl + 'audio_eng_2/audio_eng_2_aes.key';
                        } else if (newUrl.includes('example.com')) {
                            // Respaldo de seguridad para cualquier otra ruta falsa
                            const nombreKey = newUrl.substring(newUrl.lastIndexOf('/') + 1);
                            newUrl = baseUrl + nombreKey;
                        }

                        // B. Inyector Absoluto del Token SAS (Elimina el Error 409)
                        if (sasToken && !newUrl.includes(sasToken)) {
                            const separador = newUrl.includes('?') ? '&' : '?';
                            newUrl = newUrl + separador + sasToken;
                        }

                        // C. Ejecución de la Petición Limpia al Navegador
                        xhr.open('GET', newUrl, true);
                    }
                });

                hls.loadSource(this.videoSrc);
                hls.attachMedia(this.video);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    console.log("Motor HLS ensamblado con blindaje XHR universal. Desencriptando en RAM...");
                });

                hls.on(Hls.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        console.error("Error crítico en HLS:", data.details);
                    }
                });
            } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
                this.video.src = this.videoSrc; // Respaldo Apple
            }
        } else {
            // RUTA B: Es un video estándar (MP4, MKV local, etc.)
            this.video.src = this.videoSrc;
        }

        // 4. Se inicializan sus protecciones y eventos
        this.buildBlackHole();
        this.attachHardwareEvents();
        this.attachSecurityProtocols();
        this.attachMediaEvents();
    }

    renderUI() {
        this.container.innerHTML = `
            <style>
                .blazar-player-wrapper {
                    position: relative; width: 100%; background: #000;
                    border: 2px solid #ff00d4; border-radius: 8px;
                    overflow: hidden; font-family: 'OLD ENGLISH TEXT', serif;
                }
                .blazar-player-wrapper video {
                    width: 100%; display: block; transition: filter 0.1s; 
                }
                .anti-piracy-shield {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10;
                }
                .blazar-controls {
                    position: absolute; bottom: 0; left: 0; width: 100%;
                    background: linear-gradient(to top, rgba(0,0,0,0.95), transparent);
                    padding: 20px 10px 10px; display: flex; flex-direction: column; z-index: 20;
                    opacity: 0; transition: opacity 0.3s;
                }
                .blazar-player-wrapper:hover .blazar-controls { opacity: 1; }
                .blazar-progress {
                    width: 100%; appearance: none; background: #222; height: 5px; border-radius: 5px; outline: none; cursor: pointer; margin-bottom: 10px;
                }
                .blazar-progress::-webkit-slider-thumb {
                    appearance: none; width: 15px; height: 15px; border-radius: 50%;
                    background: #ff00d4; box-shadow: 0 0 10px #ff00d4;
                }
                .blazar-btn {
                    background: transparent; border: none; font-size: 1.2rem; cursor: pointer; font-weight: bold;
                    color: #000; -webkit-text-stroke: 1px #D4AF37; text-shadow: 0 0 8px rgba(212, 175, 55, 0.5);
                    text-transform: uppercase; margin-right: 15px;
                }
                .blazar-btn:hover { color: #222; -webkit-text-stroke: 1px #ff00d4; }
                .controls-row { display: flex; align-items: center; justify-content: space-between; }
                .blazar-player-wrapper:fullscreen .blazar-controls {
                opacity: 0;
                transition: opacity 0.5s ease-in-out;
               }
               .blazar-player-wrapper:fullscreen .hide-on-fullscreen {
               display: none !important;
               }
                /* ESTILOS DEL BLACK HOLE (WARM HOLE) */
                .black-hole-menu {
                    position: fixed; background: #050505; border: 1px solid #ff00d4;
                    box-shadow: 0 0 25px rgba(255, 0, 212, 0.4), inset 0 0 15px rgba(0,0,0,1);
                    border-radius: 12px; padding: 10px 0; min-width: 220px; z-index: 99999;
                    display: none; flex-direction: column; font-family: 'OLD ENGLISH TEXT', serif;
                    transform: scale(0.9); opacity: 0; transition: transform 0.2s, opacity 0.2s;
                }
                .black-hole-menu.active { display: flex; transform: scale(1); opacity: 1; }
                .bh-title {
                    color: #D4AF37; text-align: center; font-size: 1.2rem; border-bottom: 1px solid #333;
                    padding-bottom: 5px; margin-bottom: 5px; letter-spacing: 1px; -webkit-text-stroke: 0.5px #000;
                }
                .bh-item {
                    color: #ff00d4; padding: 10px 20px; cursor: pointer; font-size: 1.1rem;
                    transition: background 0.2s, color 0.2s; font-weight: bold; display: flex; justify-content: space-between;
                }
                .bh-item:hover { background: #ff00d4; color: #000; }
                }
            </style>

            <div class="blazar-player-wrapper">
                <div class="anti-piracy-shield"></div>
                <!-- ATENCIÓN: src vacío porque HLS se encargará de inyectar el Blob -->
                <video preload="auto"></video>
                <div class="blazar-controls">
                    <input type="range" class="blazar-progress" value="0" min="0" max="100" step="0.1">
                    <div class="controls-row">
                        <div>
                            <button class="blazar-btn btn-play">▶ Reproducir</button>
                            <span style="color:#D4AF37; font-size:0.9rem; margin-left:10px;">[Clic Derecho = Black Hole]</span>
                        </div>
                        <div class="blazar-btn" style="cursor:default;" class="hide-on-fullscreen">OJO DE KILROG</div>
                    </div>
                </div>
            </div>
        `;
    }

    buildBlackHole() {
        // Inyectar el menú virtual directamente en el Body para evadir recortes (overflow)
        this.blackHole = document.createElement('div');
        this.blackHole.className = 'black-hole-menu';
        this.blackHole.innerHTML = `
            <div class="bh-title">🌀 Black Hole Settings</div>
            <div class="bh-item" id="bh-fullscreen"><span>Pantalla Completa</span> <span>⛶</span></div>
            <div class="bh-item" id="bh-pip"><span>Imagen en Imagen</span> <span>📺</span></div>
            <div class="bh-item" id="bh-speed"><span>Velocidad</span> <span id="bh-speed-val">1.0x</span></div>
            <div class="bh-item" id="bh-subs"><span>Subtítulos</span> <span id="bh-subs-val">OFF</span></div>
            <div class="bh-item" id="bh-audio"><span>Audio Tracker</span> <span>⚙️</span></div>
        `;
        document.body.appendChild(this.blackHole);

        // LÓGICA DE LOS BOTONES DEL BLACK HOLE
        this.blackHole.querySelector('#bh-fullscreen').addEventListener('click', () => {
            if (!document.fullscreenElement) {
                this.container.querySelector('.blazar-player-wrapper').requestFullscreen();
            } else { document.exitFullscreen(); }
            this.closeBlackHole();
        });

        this.blackHole.querySelector('#bh-pip').addEventListener('click', () => {
            if (document.pictureInPictureElement) {
                document.exitPictureInPicture();
            } else { this.video.requestPictureInPicture(); }
            this.closeBlackHole();
        });

        this.blackHole.querySelector('#bh-speed').addEventListener('click', (e) => {
            let rates = [0.5, 1.0, 1.25, 1.5, 2.0];
            let current = this.video.playbackRate;
            let next = rates[(rates.indexOf(current) + 1) % rates.length];
            this.video.playbackRate = next;
            e.currentTarget.querySelector('#bh-speed-val').innerText = next.toFixed(1) + 'x';
            this.showVisualFeedback(`Velocidad: ${next}x`);
            // No cerramos el menú aquí para que el usuario pueda ciclar la velocidad
        });

        this.blackHole.querySelector('#bh-subs').addEventListener('click', (e) => {
            // Lógica Base para apagar/encender pistas de texto si existen
            let tracks = this.video.textTracks;
            if (tracks.length > 0) {
                let currentMode = tracks[0].mode;
                tracks[0].mode = currentMode === 'showing' ? 'hidden' : 'showing';
                e.currentTarget.querySelector('#bh-subs-val').innerText = tracks[0].mode === 'showing' ? 'ON' : 'OFF';
            } else {
                this.showVisualFeedback("Sin Subs Físicos");
            }
        });
    }

    attachHardwareEvents() {
        // INVOCAR EL BLACK HOLE EN TODA LA PÁGINA (Bloqueo de Clic Derecho global)
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // Aniquila el menú nativo de Windows/Navegador
            this.openBlackHole(e.clientX, e.clientY);
        });

        // CERRAR EL BLACK HOLE AL HACER CLIC FUERA
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.black-hole-menu')) {
                this.closeBlackHole();
            }
        });

        // CONTROL DE RATÓN GAMER Y CLICS ZONA VIDEO
        document.addEventListener('mousedown', (e) => {
            // Canal 3 = Lateral Atrás, Canal 4 = Lateral Adelante
            if (e.button === 3) {
                e.preventDefault();
                this.video.currentTime -= 10;
                this.showVisualFeedback("<< 10s");
            } else if (e.button === 4) {
                e.preventDefault();
                this.video.currentTime += 10;
                this.showVisualFeedback(">> 10s");
            }
        });

        // Clic Izquierdo en el escudo (Video)
        this.shield.addEventListener('click', (e) => {
            if (e.button === 0) this.togglePlay();
        });

        // Teclado
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') { e.preventDefault(); this.togglePlay(); }
            if (e.code === 'ArrowRight') this.video.currentTime += 5;
            if (e.code === 'ArrowLeft') this.video.currentTime -= 5;
        });
    }

    attachSecurityProtocols() {
        document.addEventListener('keyup', (e) => {
            if (e.key === 'PrintScreen') {
                this.video.style.filter = 'brightness(0)';
                navigator.clipboard.writeText("Bloqueo de Piratería - Universo BDH");
                setTimeout(() => { this.video.style.filter = 'none'; }, 3000);
            }
        });
        document.addEventListener('visibilitychange', () => {
            this.video.style.filter = document.hidden ? 'brightness(0)' : 'none';
        });
    }

    attachMediaEvents() {
        this.video.addEventListener('timeupdate', () => {
            if (!this.video.duration) return;
            const progress = (this.video.currentTime / this.video.duration) * 100;
            this.progressBar.value = progress;
            this.progressBar.style.background = `linear-gradient(to right, #ff00d4 ${progress}%, #222 ${progress}%)`;
        });
        this.progressBar.addEventListener('input', (e) => {
            this.video.currentTime = (e.target.value / 100) * this.video.duration;
        });
        this.btnPlay.addEventListener('click', () => this.togglePlay());

        // Lógica de inactividad (Idle Timer) para Pantalla Completa
        let inactividadTimer;
        this.container.addEventListener('mousemove', () => {
            // Solo actuamos si estamos en pantalla completa
            if (document.fullscreenElement) {
                // 1. Mostrar cursor y controles al mover el ratón
                this.container.style.cursor = 'default';
                this.container.querySelector('.blazar-controls').style.opacity = '1';

                // 2. Limpiar el temporizador anterior
                clearTimeout(inactividadTimer);

                // 3. Iniciar cuenta regresiva (ej: 2.5 segundos) para volver a ocultar
                inactividadTimer = setTimeout(() => {
                    if (document.fullscreenElement) {
                        this.container.style.cursor = 'none'; // Aniquila el puntero
                        this.container.querySelector('.blazar-controls').style.opacity = '0'; // Aniquila la barra
                    }
                }, 2500);
            } else {
                // Restaurar el cursor normal si salimos de pantalla completa
                this.container.style.cursor = 'default';
            }
        });
    }

    togglePlay() {
        if (this.video.paused) {
            this.video.play();
            this.btnPlay.innerText = "❚❚";
        } else {
            this.video.pause();
            this.btnPlay.innerText = "▶";
        }
    }

    openBlackHole(x, y) {
        // Asegurar que el menú no se salga de la pantalla
        this.blackHole.style.left = `${x}px`;
        this.blackHole.style.top = `${y}px`;

        // Timeout minúsculo para la animación de escala/opacidad
        setTimeout(() => this.blackHole.classList.add('active'), 10);
    }

    closeBlackHole() {
        this.blackHole.classList.remove('active');
    }

    showVisualFeedback(text) {
        // Buscar si ya hay un feedback y eliminarlo para no encimarlos
        let oldFeedback = this.container.querySelector('.v-feedback');
        if (oldFeedback) oldFeedback.remove();

        const feedback = document.createElement('div');
        feedback.className = 'v-feedback';
        feedback.innerText = text;
        feedback.style.cssText = `
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            color: #000; -webkit-text-stroke: 1.5px #ff00d4; font-size: 4rem; font-weight: bold;
            z-index: 100; pointer-events: none; text-shadow: 0 0 20px rgba(255, 0, 212, 0.8);
            animation: pulse-fade 1s forwards; font-family: 'OLD ENGLISH TEXT', serif;
        `;
        // Inyectar el keyframe temporalmente si no existe
        if (!document.getElementById('feedback-style')) {
            const style = document.createElement('style');
            style.id = 'feedback-style';
            style.innerHTML = `@keyframes pulse-fade { 0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; } 50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(1); opacity: 0; } }`;
            document.head.appendChild(style);
        }

        this.container.querySelector('.blazar-player-wrapper').appendChild(feedback);
        setTimeout(() => feedback.remove(), 1000);
    }
}