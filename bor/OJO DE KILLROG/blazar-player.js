/**
 *  BLAZAR ON READY - KEPPLER ENGINE WEB (Ojo de Kilrog)
 *  Librería de Reproducción Vanilla JS - Build: Black Hole Edition
 */
class BlazarPlayer {
    constructor(containerSelector, videoSrc) {
        this.container = document.querySelector(containerSelector);
        this.videoSrc = videoSrc;

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

        // 3. ENRUTADOR BIFURCADO FÁCTICO CON INTERCEPTOR DE HARDWARE (XHR)
        if (this.videoSrc.includes('.m3u8')) {
            // RUTA A: Stream HLS con manifiesto y firma SAS
            const partesUrl = this.videoSrc.split('?');
            const baseUrl = partesUrl.substring(0, partesUrl.lastIndexOf('/') + 1);
            const sasToken = partesUrl.slice(1).join('?');

            if (typeof Hls !== 'undefined' && Hls.isSupported()) {
                const hls = new Hls({
                    debug: false,
                    xhrSetup: function (xhr, url) {
                        let newUrl = url;

                        // A. Remapeo de claves y rutas
                        if (newUrl.includes('example.com/keys/audio_spa_1.key')) {
                            newUrl = baseUrl + 'audio_spa_1/audio_spa_1_aes.key';
                        } else if (newUrl.includes('example.com/keys/audio_eng_2.key')) {
                            newUrl = baseUrl + 'audio_eng_2/audio_eng_2_aes.key';
                        } else if (newUrl.includes('example.com')) {
                            const nombreKey = newUrl.substring(newUrl.lastIndexOf('/') + 1);
                            newUrl = baseUrl + nombreKey;
                        }

                        // B. Inyección del Token SAS de Azure
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
                    console.log("Motor HLS ensamblado con blindaje XHR universal.");
                    this.video.play().then(() => {
                        if (this.btnPlay) this.btnPlay.innerText = "❚❚";
                    }).catch(err => {
                        console.log("Autoplay diferido:", err);
                    });
                });

                hls.on(Hls.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        console.error("Error crítico en HLS:", data.details);
                    }
                });
            } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
                this.video.src = this.videoSrc; // Respaldo Safari/Apple
                this.video.play().catch(e => console.log("Autoplay bloqueado:", e));
            }
        } else {
            // RUTA B: Video directo (MKV, MP4, OneDrive o Azure Blob)
            this.video.src = this.videoSrc;
            this.video.play().then(() => {
                if (this.btnPlay) this.btnPlay.innerText = "❚❚";
            }).catch(err => {
                console.log("Autoplay diferido por el navegador:", err);
                // Mantenemos el estado de la UI coherente si falla el autoplay
                if (this.btnPlay) this.btnPlay.innerText = "▶"; 
            });
        }

        // 4. Inicializar subsistemas de protecciones y control hardware
        this.buildBlackHole();
        this.attachHardwareEvents();
        this.attachSecurityProtocols();
        this.attachMediaEvents();
    }

    renderUI() {
        this.container.innerHTML = `
            
▶ Reproducir
[Clic Derecho = Black Hole]

OJO DE KILROG

`;
}

buildBlackHole() {
let existingMenu = document.querySelector('.black-hole-menu');
if (existingMenu) existingMenu.remove();

this.blackHole = document.createElement('div');
this.blackHole.className = 'black-hole-menu';
this.blackHole.innerHTML = `
🌀 Black Hole Settings

Pantalla Completa ⛶

Imagen en Imagen 📺

Velocidad 1.0x

Subtítulos OFF

Audio Tracker ⚙️

    `;
    document.body.appendChild(this.blackHole);

    this.blackHole.querySelector('#bh-fullscreen').addEventListener('click', () => {
        if (!document.fullscreenElement) {
            this.container.querySelector('.blazar-player-wrapper').requestFullscreen();
        } else { 
            document.exitFullscreen(); 
        }
        this.closeBlackHole();
    });

    this.blackHole.querySelector('#bh-pip').addEventListener('click', () => {
        if (document.pictureInPictureElement) {
            document.exitPictureInPicture();
        } else { 
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
        if (tracks.length > 0) {
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
        e.preventDefault();
        this.openBlackHole(e.clientX, e.clientY);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.black-hole-menu')) {
            this.closeBlackHole();
        }
    });

    document.addEventListener('mousedown', (e) => {
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
        this.progressBar.style.background = `linear-gradient(to right, #ff00d4 \({progress}%, #222\){progress}%)`;
    });

    this.progressBar.addEventListener('input', (e) => {
        this.video.currentTime = (e.target.value / 100) * this.video.duration;
    });

    this.btnPlay.addEventListener('click', () => this.togglePlay());

    let inactividadTimer;
    this.container.addEventListener('mousemove', () => {
        if (document.fullscreenElement) {
            this.container.style.cursor = 'default';
            const controls = this.container.querySelector('.blazar-controls');
            if (controls) controls.style.opacity = '1';

            clearTimeout(inactividadTimer);

            inactividadTimer = setTimeout(() => {
                if (document.fullscreenElement) {
                    this.container.style.cursor = 'none';
                    if (controls) controls.style.opacity = '0';
                }
            }, 2500);
        } else {
            this.container.style.cursor = 'default';
        }
    });
}

togglePlay() {
    if (this.video.paused) {
        this.video.play().then(() => {
            this.btnPlay.innerText = "❚❚";
        }).catch(err => {
            console.log("Error al reproducir:", err);
        });
    } else {
        this.video.pause();
        this.btnPlay.innerText = "▶";
    }
}

openBlackHole(x, y) {
    const menuWidth = this.blackHole.offsetWidth || 220;
    const menuHeight = this.blackHole.offsetHeight || 200;
    let finalX = x;
    let finalY = y;

    if (x + menuWidth > window.innerWidth) finalX = window.innerWidth - menuWidth - 10;
    if (y + menuHeight > window.innerHeight) finalY = window.innerHeight - menuHeight - 10;

    this.blackHole.style.left = `${finalX}px`;
    this.blackHole.style.top = `${finalY}px`;

    setTimeout(() => this.blackHole.classList.add('active'), 10);
}

closeBlackHole() {
    this.blackHole.classList.remove('active');
}

showVisualFeedback(text) {
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
