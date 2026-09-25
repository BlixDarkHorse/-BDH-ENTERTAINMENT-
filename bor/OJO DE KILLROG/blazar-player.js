/**
 * BLAZAR ON READY - KEPPLER ENGINE WEB (Ojo de Kilrog)
 * Librería de Reproducción Vanilla JS - Build: Black Hole Edition (Ultra-Robust)
 */
class BlazarPlayer {
    constructor(containerSelector, videoSrc) {
        this.container = document.querySelector(containerSelector);
        this.videoSrc = videoSrc;
        
        if (!this.container) {
            console.error("BlazarPlayer: Contenedor no encontrado.");
            return;
        }
        
        this.init();
    }

    renderUI() {
        this.container.innerHTML = `
▶

00:00 / 00:00

[ ]

    `;
}

init() {
    // 1. Construcción de UI
    this.renderUI();

    // 2. Captura de nodos en el DOM
    this.wrapper = this.container.querySelector('.blazar-wrapper');
    this.video = this.container.querySelector('video');
    this.progressBar = this.container.querySelector('.blazar-progress');
    this.progressContainer = this.container.querySelector('.blazar-progress-container');
    this.btnPlay = this.container.querySelector('.btn-play');
    this.btnFullscreen = this.container.querySelector('.btn-fullscreen');
    this.timeDisplay = this.container.querySelector('.blazar-time');
    this.shield = this.container.querySelector('.anti-piracy-shield');
    this.controls = this.container.querySelector('.blazar-controls');

    // 3. ENRUTADOR ESTRICTO DE MEDIOS
    const esHls = this.videoSrc.toLowerCase().includes('.m3u8');

    if (esHls && typeof Hls !== 'undefined' && Hls.isSupported()) {
        // RUTA A: Inicialización de flujo particionado HLS
        const partesUrl = this.videoSrc.split('?');
        const sasToken = partesUrl.slice(1).join('?');

        this.hls = new Hls({
            debug: false,
            xhrSetup: (xhr, url) => {
                let newUrl = url;
                if (sasToken) {
                    // Si el fragmento es de Azure y ya trae un SAS viejo, se lo quitamos
                    if (newUrl.includes('blob.core.windows.net') && newUrl.includes('?')) {
                        newUrl = newUrl.split('?')[0];
                    }
                    if (!newUrl.includes(sasToken)) {
                        const separador = newUrl.includes('?') ? '&' : '?';
                        newUrl = newUrl + separador + sasToken;
                    }
                }
                xhr.open('GET', newUrl, true);
            }
        });

        this.hls.loadSource(this.videoSrc);
        this.hls.attachMedia(this.video);

        this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
            this.video.play().catch(e => console.log("Autoplay diferido (HLS):", e));
        });

        this.hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                console.warn("Fallo crítico en HLS. Destruyendo instancia y pasando a fallback.");
                this.hls.destroy();
                this.startDirectPlayback();
            }
        });
    } else {
        // RUTA B: Para .mkv, .mp4, OneDrive o Azure Blob directo
        this.startDirectPlayback();
    }

    // 4. Activación de módulos de Protección y Eventos
    this.buildBlackHole();
    this.attachHardwareEvents();
    this.attachSecurityProtocols();
    this.attachMediaEvents();
}

startDirectPlayback() {
    this.video.src = this.videoSrc;
    this.video.play().catch(e => console.log("Autoplay diferido (Directo):", e));
}

playVideo() {
    if (this.video.paused) {
        this.video.play().catch(err => {
            console.warn("BlazarPlayer: Reproducción automática bloqueada por políticas del navegador.", err);
        });
        this.btnPlay.textContent = '⏸';
    } else {
        this.video.pause();
        this.btnPlay.textContent = '▶';
    }
}

attachMediaEvents() {
    // Controles de reproducción principal
    this.btnPlay.addEventListener('click', () => this.playVideo());
    this.shield.addEventListener('click', () => this.playVideo());

    // Actualización de progreso
    this.video.addEventListener('timeupdate', () => {
        const porcentaje = (this.video.currentTime / this.video.duration) * 100;
        this.progressBar.style.width = `${porcentaje}%`;
        this.updateTimeDisplay();
    });

    // Búsqueda en la barra de progreso (Seek)
    this.progressContainer.addEventListener('click', (e) => {
        const rect = this.progressContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        this.video.currentTime = pos * this.video.duration;
    });

    // Eventos de metadatos para tiempo inicial
    this.video.addEventListener('loadedmetadata', () => {
        this.updateTimeDisplay();
    });

    // Pantalla completa
    this.btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            this.wrapper.requestFullscreen().catch(err => {
                console.error("BlazarPlayer: Error al intentar pantalla completa.", err);
            });
        } else {
            document.exitFullscreen();
        }
    });

    // Hover para mostrar controles
    this.wrapper.addEventListener('mouseenter', () => {
        this.controls.style.opacity = '1';
    });
    this.wrapper.addEventListener('mouseleave', () => {
        if (!this.video.paused) {
            this.controls.style.opacity = '0';
        }
    });
}

updateTimeDisplay() {
    const formatTime = (time) => {
        if (isNaN(time)) return "00:00";
        const minutos = Math.floor(time / 60);
        const segundos = Math.floor(time % 60);
        return `\({minutos.toString().padStart(2, '0')}:\){segundos.toString().padStart(2, '0')}`;
    };
    this.timeDisplay.textContent = `\({formatTime(this.video.currentTime)} /\){formatTime(this.video.duration)}`;
}

attachHardwareEvents() {
    // Control de reproducción por teclado a nivel de contenedor
    this.wrapper.setAttribute('tabindex', '0');
    this.wrapper.addEventListener('keydown', (e) => {
        switch(e.key) {
            case ' ':
            case 'k':
            case 'K':
                e.preventDefault();
                this.playVideo();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.video.currentTime = Math.min(this.video.currentTime + 5, this.video.duration);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.video.currentTime = Math.max(this.video.currentTime - 5, 0);
                break;
            case 'f':
            case 'F':
                this.btnFullscreen.click();
                break;
        }
    });
}

attachSecurityProtocols() {
    // Inhabilitar menú contextual
    this.wrapper.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // Inhabilitar atajos de herramientas de desarrollo locales dentro del contexto visual
    this.wrapper.addEventListener('keydown', (e) => {
        if (e.key === 'F12' || 
           (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) || 
           (e.ctrlKey && e.key === 'u')) {
            e.preventDefault();
        }
    });
    
    // Deshabilitar arrastre (drag) del video
    this.video.addEventListener('dragstart', (e) => {
        e.preventDefault();
    });
}

buildBlackHole() {
    // Lógica de ofuscación de consola o auditoría forense pasiva del entorno web
    const debugTrap = new Function('debugger');
    setInterval(() => {
        const before = new Date().getTime();
        // debugTrap(); // Descomentar en despliegue de producción para colgar DevTools
        const after = new Date().getTime();
        if (after - before > 100) {
            // Interrupción detectada
        }
    }, 1000);
}

destroy() {
    // Liberación de memoria para evitar fugas en el DOM
    if (this.hls) {
        this.hls.destroy();
    }
    this.video.pause();
    this.video.removeAttribute('src');
    this.video.load();
    this.container.innerHTML = '';
}
}
