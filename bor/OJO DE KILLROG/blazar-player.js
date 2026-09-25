
/**
 * BLAZAR ON READY - KEPPLER ENGINE WEB (Ojo de Kilrog)
 * Librería de Reproducción Vanilla JS - Build: Black Hole Edition (Ultra-Robust)
 */
class BlazarPlayer {
    constructor(containerSelector, videoSrc) {
        this.container = document.querySelector(containerSelector);
        this.videoSrc = videoSrc;

        if (!this.container) {
            console.error("Contenedor no encontrado:", containerSelector);
            return;
        }

        this.init();
    }

    init() {
        // 1. Construye la interfaz HTML y estilos en el contenedor
        this.renderUI();

        // 2. Captura los elementos del DOM
        this.video = this.container.querySelector('video');
        this.progressBar = this.container.querySelector('.blazar-progress');
        this.btnPlay = this.container.querySelector('.btn-play');
        this.shield = this.container.querySelector('.anti-piracy-shield');

        // 3. ENRUTADOR BIFURCADO CON FALLBACK AUTOMÁTICO
        const isHls = this.videoSrc.includes('.m3u8');

        if (isHls && typeof Hls !== 'undefined' && Hls.isSupported()) {
            // RUTA A: Stream HLS con Hls.js
            const partesUrl = this.videoSrc.split('?');
            const sasToken = partesUrl.slice(1).join('?');

            const hls = new Hls({
                debug: false,
                xhrSetup: (xhr, url) => {
                    let newUrl = url;
                    if (sasToken && !newUrl.includes(sasToken)) {
                        const separador = newUrl.includes('?') ? '&' : '?';
                        newUrl = newUrl + separador + sasToken;
                    }
                    xhr.open('GET', newUrl, true);
                }
            });

            hls.loadSource(this.videoSrc);
            hls.attachMedia(this.video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                this.playVideo();
            });

            // FALLBACK AUTOMÁTICO SI HLS FALLA
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    console.warn("Fallo en HLS (" + data.details + "). Cambiando a reproductor directo...");
                    hls.destroy();
                    this.startDirectPlayback();
                }
            });
        } else {
            // RUTA B: Video estándar (MKV, MP4, OneDrive o Azure Blob directo)
            this.startDirectPlayback();
        }

        // 4. Inicializar subsistemas de protecciones y control hardware
        this.buildBlackHole();
        this.attachHardwareEvents();
        this.attachSecurityProtocols();
        this.attachMediaEvents();
    }

    startDirectPlayback() {
        this.video.src = this.videoSrc;
        this.playVideo();
    }

    playVideo() {
        this.video.play().then(() => {
            if (this.btnPlay) this.btnPlay.innerText = "❚❚ Pausa";
        }).catch(err => {
            console.log("Autoplay diferido por interacción del navegador:", err);
            if (this.btnPlay) this.btnPlay.innerText = "▶ Reproducir";
        });
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
                    width: 100%; display: block; transition: filter 0.1s; background: #000;
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
                    opacity: 0; transition: opacity 0.5s ease-in-out;
                }
                .blazar-player-wrapper:fullscreen .hide-on-fullscreen {
                    display: none !important;
                }
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
            </style>

            <div class="blazar-player-wrapper">
                <div class="anti-piracy-shield"></div>
                <video preload="auto"></video>
                <div class="blazar-controls">
                    <input type="range" class="blazar-progress" value="0" min="0" max="100" step="0.1">
                    <div class="controls-row">
                        <div>
                            <button class="blazar-btn btn-play">▶ Reproducir</button>
                            <span style="color:#D4AF37; font-size:0.9rem; margin-left:10px;">[Clic Derecho = Black Hole]</span>
                        </div>
                        <div class="blazar-btn hide-on-fullscreen" style="cursor:default;">OJO DE KILROG</div>
                    </div>
                </div>
            </div>
        `;
    }

    buildBlackHole() {
        let existingMenu = document.querySelector('.black-hole-menu');
        if (existingMenu) existingMenu.remove();

        this.blackHole = document.createElement('div');
        this.blackHole.className = 'black-hole-menu';
        this.blackHole.innerHTML = `
            <div class="bh-title">🌀 Black Hole Settings</div>
            <div class="bh-item" id="bh-fullscreen"><span>Pantalla Completa</span> <span>⛶</span></div>
            <div class="bh-item" id="bh-pip"><span>Imagen en Imagen</span> <span>📺</span></div>
            <div class="bh-item" id="bh-speed"><span>Velocidad</span> <span id="bh-speed-val">1.0x</span></div>
            <div class="bh-item" id="bh-subs"><span>Subtítulos</span> <span id="bh-subs-val">OFF</span></div>
        `;
        document.body.appendChild(this.blackHole);

        this.blackHole.querySelector('#bh-fullscreen').addEventListener('click', () => {
            const wrapper = this.container.querySelector('.blazar-player-wrapper');
            if (!document.fullscreenElement) {
                if (wrapper.requestFullscreen) wrapper.requestFullscreen();
            } else { 
                if (document.exitFullscreen) document.exitFullscreen(); 
            }
            this.closeBlackHole();
        });

        this.blackHole.querySelector('#bh-pip').addEventListener('click', () => {
            if (document.pictureInPictureElement) {
                document.exitPictureInPicture();
            } else if (this.video.requestPictureInPicture) { 
                this.video.requestPictureInPicture(); 
            }
            this.closeBlackHole();
        });

        this.blackHole.querySelector('#bh-speed').addEventListener('click', (e) => {
            let rates = [0.5, 1.0, 1.25, 1.5, 2.0];
            let current = this.video.playbackRate;
            let next = rates[(rates.indexOf(current) + 1) % rates.length];
            this.video.playbackRate = next;
            e.currentTarget.querySelector('#bh-speed-val').innerText = next.toFixed(1) + 'x';
            this.showVisualFeedback(`Velocidad: ${next}x`);
        });

        this.blackHole.querySelector('#bh-subs').addEventListener('click', (e) => {
            let tracks = this.video.textTracks;
            if (tracks && tracks.length > 0) {
                let currentMode = tracks.mode;
                tracks.mode = currentMode === 'showing' ? 'hidden' : 'showing';
                e.currentTarget.querySelector('#bh-subs-val').innerText = tracks.mode === 'showing' ? 'ON' : 'OFF';
            } else {
                this.showVisualFeedback("Sin Subs Físicos");
            }
        });
    }

    attachHardwareEvents() {
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.blazar-player-wrapper')) {
                e.preventDefault();
                this.openBlackHole(e.clientX, e.clientY);
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.black-hole-menu')) {
                this.closeBlackHole();
            }
        });

        this.shield.addEventListener('click', (e) => {
            if (e.button === 0) this.togglePlay();
        });

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') { 
                e.preventDefault(); 
                this.togglePlay(); 
            }
            if (e.code === 'ArrowRight') {
                this.video.currentTime += 5;
                this.showVisualFeedback(">> 5s");
            }
            if (e.code === 'ArrowLeft') {
                this.video.currentTime -= 5;
                this.showVisualFeedback("<< 5s");
            }
        });
    }

    attachSecurityProtocols() {
        document.addEventListener('keyup', (e) => {
            if (e.key === 'PrintScreen') {
                this.video.style.filter = 'brightness(0)';
                if (navigator.clipboard) {
                    navigator.clipboard.writeText("Bloqueo de Piratería - Universo BDH");
                }
                setTimeout(() => {
                    this.video.style.filter = 'none';
                }, 3000);
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
            if (this.video.duration) {
                this.video.currentTime = (e.target.value / 100) * this.video.duration;
            }
        });

        this.btnPlay.addEventListener('click', () => this.togglePlay());
    }

    togglePlay() {
        if (this.video.paused) {
            this.video.play().then(() => {
                if (this.btnPlay) this.btnPlay.innerText = "❚❚ Pausa";
            }).catch(err => {
                console.log("Error al reproducir:", err);
            });
        } else {
            this.video.pause();
            if (this.btnPlay) this.btnPlay.innerText = "▶ Reproducir";
        }
    }

    openBlackHole(x, y) {
        const menuWidth = 220;
        let finalX = x;
        let finalY = y;

        if (x + menuWidth > window.innerWidth) finalX = window.innerWidth - menuWidth - 10;

        this.blackHole.style.left = `${finalX}px`;
        this.blackHole.style.top = `${finalY}px`;

        setTimeout(() => this.blackHole.classList.add('active'), 10);
    }

    closeBlackHole() {
        if (this.blackHole) this.blackHole.classList.remove('active');
    }

    showVisualFeedback(text) {
        let oldFeedback = this.container.querySelector('.v-feedback');
        if (oldFeedback) oldFeedback.remove();

        const feedback = document.createElement('div');
        feedback.className = 'v-feedback';
        feedback.innerText = text;
        feedback.style.cssText = `
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            color: #000; -webkit-text-stroke: 1.5px #ff00d4; font-size: 3rem; font-weight: bold;
            z-index: 100; pointer-events: none; text-shadow: 0 0 20px rgba(255, 0, 212, 0.8);
            animation: pulse-fade 1s forwards; font-family: 'OLD ENGLISH TEXT', serif;
        `;

        if (!document.getElementById('feedback-style')) {
            const style = document.createElement('style');
            style.id = 'feedback-style';
            style.innerHTML = `@keyframes pulse-fade { 
                0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; } 
                50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; } 
                100% { transform: translate(-50%, -50%) scale(1); opacity: 0; } 
            }`;
            document.head.appendChild(style);
        }

        const wrapper = this.container.querySelector('.blazar-player-wrapper');
        if (wrapper) wrapper.appendChild(feedback);
        setTimeout(() => feedback.remove(), 1000);
    }
}
