/**
 * BLAZAR ON READY - KEPPLER ENGINE WEB (Ojo de Kilrog)
 * Build: Black Hole Complete Edition + Rouse Calibration & Lock
 */
class BlazarPlayer {
constructor(containerSelector, videoSrc, options = {}) {
        this.container = document.querySelector(containerSelector);
        this.videoSrc = videoSrc || '';
        this.options = options;
        this.hls = null;
        this.isLocked = false;
        this.isDestroyed = false;

        // Banderas de control Dual-State para la línea de tiempo (YouTube/Netflix style)
        this.isUserSeeking = false;
        this.pendingSeekTime = null;
        this.seekThrottleTimer = null;
        this.lastSeekTime = 0;
        this.isDragListenersAttached = false;
        this.boundOnGlobalSeekRelease = null;

        // Registro de escuchadores para prevención total de fugas en SPA
        this.trackedListeners = [];

        this.currentMediaKey = '';
        this.currentMediaTitle = '';
        this.currentMediaSeries = '';
        this.hasResumedCurrentSource = false;
        this.lastSaveTimestamp = 0;
        
        // Sensor de entorno
        this.isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth <= 768;
        
        // Recálculo táctico en tiempo real si se redimensiona la ventana
        this.addTrackedListener(window, 'resize', () => {
            if (this.isDestroyed) return;
            this.isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth <= 768;
        });
        
        this.init();
    }

    addTrackedListener(target, type, handler, options) {
        if (!target) return;
        target.addEventListener(type, handler, options);
        this.trackedListeners.push({ target, type, handler, options });
    }

    attachSeekDragListeners(commitSeekFn) {
        if (this.isDragListenersAttached) return;
        this.isDragListenersAttached = true;
        this.boundOnGlobalSeekRelease = () => {
            if (this.isUserSeeking && !this.isLocked && !this.isDestroyed) {
                commitSeekFn();
            } else {
                this.detachSeekDragListeners();
            }
        };
        window.addEventListener('mouseup', this.boundOnGlobalSeekRelease);
        window.addEventListener('touchend', this.boundOnGlobalSeekRelease);
        window.addEventListener('pointerup', this.boundOnGlobalSeekRelease);
        window.addEventListener('pointercancel', this.boundOnGlobalSeekRelease);
    }

    detachSeekDragListeners() {
        if (!this.isDragListenersAttached) return;
        this.isDragListenersAttached = false;
        if (this.boundOnGlobalSeekRelease) {
            window.removeEventListener('mouseup', this.boundOnGlobalSeekRelease);
            window.removeEventListener('touchend', this.boundOnGlobalSeekRelease);
            window.removeEventListener('pointerup', this.boundOnGlobalSeekRelease);
            window.removeEventListener('pointercancel', this.boundOnGlobalSeekRelease);
            this.boundOnGlobalSeekRelease = null;
        }
    }

    init() {
        this.renderUI();
        this.capturarElementos();
        this.buildMenus(); // Reemplaza a this.buildBlackHole()
        this.attachHardwareEvents();
        this.attachSecurityProtocols();
        this.attachMediaEvents();
        // ... (resto del init intacto)

        if (this.options.title) {
            this.updateBlazarMetadata(this.options.title, this.options.series, '');
        }

        if (this.videoSrc) {
            this.enrutarVideo();
        }
    }

    renderUI() {
        this.container.innerHTML = `
            <div class="blazar-player-wrapper">
                <div class="keppler-ambient-glow"></div>
                <div class="anti-piracy-shield"></div>
                
                <!-- Candado de Bloqueo de Hardware Purificado -->
                <div class="lock-indicator lock-hidden">
                    🔒 BLOQUEADO (Doble toque para abrir)
                </div>

                <!-- Burbuja Central de Explicación Universo BDH -->
                <div id="blazar-tooltip-overlay"></div>

                <video preload="auto" crossorigin="anonymous" playsinline webkit-playsinline></video>
                
                <div class="blazar-top-bar">
                    <div class="blazar-title-group">
                        <span class="blazar-series-tag">UNIVERSO BDH</span>
                        <span class="blazar-track-title">Cargando Motor...</span>
                    </div>
                    <div class="blazar-brand-center">BLAZAR ON READY</div>
                    <div class="blazar-top-actions">
                        <button class="blazar-icon-btn" id="btn-top-gold" data-tooltip="Corcel Dorado">🐎</button>
                        <button class="blazar-icon-btn" id="btn-top-pink" data-tooltip="Dragón Eléctrico">🐉</button>
                        <button class="blazar-icon-btn" id="btn-top-blackhole" data-tooltip="Warm Hole">🐛</button>
                        <button class="blazar-icon-btn" id="btn-top-fullscreen" data-tooltip="Pantalla Completa">⛶</button>
                        <button class="blazar-icon-btn" id="btn-top-pip" data-tooltip="Imagen en Imagen (PiP)">📺</button>
                        <button class="blazar-icon-btn" id="btn-top-lock" data-tooltip="Bloquear Pantalla">🔒</button>
                    </div>
                </div>
                <div class="blazar-controls">
                    <div class="progress-container">
                        <div class="blazar-progress-filled"></div>
                        <input type="range" class="blazar-progress" value="0" min="0" max="100" step="0.1">
                    </div>
                    <div class="controls-row">
                        <div class="controls-left">
                            <button class="blazar-btn btn-play" data-tooltip="Reproducir / Pausa">▶</button>
                            <div class="vol-control-group">
                                <button class="blazar-btn btn-vol" data-tooltip="Silenciar / Activar Sonido">🔊</button>
                                <input type="range" class="blazar-vol-slider" value="1" min="0" max="1" step="0.1">
                            </div>
                            <span class="blazar-time-display" style="margin-left: 10px;">00:00</span>
                        </div>
                        <div class="blazar-watermark-center">
                            © 2026 🪐🕷🕸 ¡HOY CONSTRUIMOS EL IMPERIO! 🖤🔥🚀
                        </div>
                        <div class="controls-right" style="display:flex; gap:6px; align-items:center;">
                            <button class="blazar-btn btn-prev-ep" data-tooltip="Capítulo Anterior">⏮</button>
                            <button class="blazar-btn btn-toggle-ficha" data-tooltip="Ficha Técnica" style="font-size:0.8rem; background:rgba(255,255,255,0.1); padding:4px 10px; border-radius:4px;">📑 Ficha</button>
                            <button class="blazar-btn btn-next-ep" data-tooltip="Siguiente Capítulo">⏭</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    capturarElementos() {
        this.video = this.container.querySelector('video');
        this.progressBar = this.container.querySelector('.blazar-progress');
        this.progressFilled = this.container.querySelector('.blazar-progress-filled');
        this.btnPlay = this.container.querySelector('.btn-play');
        this.btnVol = this.container.querySelector('.btn-vol');
        this.volSlider = this.container.querySelector('.blazar-vol-slider');
        this.timeDisplay = this.container.querySelector('.blazar-time-display');
        this.shield = this.container.querySelector('.anti-piracy-shield');
        this.ambientGlow = this.container.querySelector('.keppler-ambient-glow');
        this.lockIndicator = this.container.querySelector('.lock-indicator');
        this.controlsUi = this.container.querySelector('.blazar-controls');
        this.topBarUi = this.container.querySelector('.blazar-top-bar');
        
        this.seriesTag = this.container.querySelector('.blazar-series-tag');
        this.trackTitle = this.container.querySelector('.blazar-track-title');
        
        this.btnTopBh = this.container.querySelector('#btn-top-blackhole');
        this.btnTopPip = this.container.querySelector('#btn-top-pip');
        this.btnTopFs = this.container.querySelector('#btn-top-fullscreen');
        this.btnBottomBh = this.container.querySelector('.btn-bh-trigger');
        this.tooltipOverlay = this.container.querySelector('#blazar-tooltip-overlay');
    }

    updateBlazarMetadata(title, series, tag) {
        if (this.trackTitle) this.trackTitle.innerText = title || '';
        if (this.seriesTag) this.seriesTag.innerText = (series || 'UNIVERSO BDH') + (tag ? ` • ${tag}` : '');
    }

    loadSource(url, title, series, tag) {
        this.videoSrc = url;
        this.currentMediaKey = (url || '').split('?')[0];
        this.currentMediaTitle = title || '';
        this.currentMediaSeries = series || '';
        this.hasResumedCurrentSource = false;

        if (this.hls) {
            this.hls.destroy();
            this.hls = null;
        }
        this.video.removeAttribute('src');
        this.video.load();
        if (title) this.updateBlazarMetadata(title, series, tag);
        this.enrutarVideo();
        setTimeout(() => {
            this.checkAndResumePlayback();
            this.togglePlay(true);
        }, 400);
    }

    enrutarVideo() {
        if (!this.videoSrc) return;

        if (this.videoSrc.includes('.m3u8')) {
            const partesUrl = this.videoSrc.split('?');
            const baseUrl = partesUrl[0].substring(0, partesUrl[0].lastIndexOf('/') + 1);
            const sasToken = partesUrl.slice(1).join('?');

            if (typeof Hls !== 'undefined' && Hls.isSupported()) {
                const normalizarMasterEnMemoria = (manifest) => {
                    const lineas = manifest.split(/\r?\n/);
                    const salida = [];
                    let audioDefaultAsignado = false;
                    for (let i = 0; i < lineas.length; i++) {
                        let linea = lineas[i];
                        const limpia = linea.trim();
                        if (limpia.startsWith('#EXT-X-MEDIA:TYPE=SUBTITLES')) continue;
                        if (limpia.startsWith('#EXT-X-STREAM-INF:')) {
                            const esAudio = !limpia.includes('RESOLUTION=') && /CODECS="mp4a\./i.test(limpia);
                            if (esAudio) { i++; continue; }
                            linea = linea.replace(/,SUBTITLES="[^"]+"/g, '');
                            linea = linea.replace(/,mp4a\.[^"]+/g, '');
                        }
                        if (limpia.startsWith('#EXT-X-MEDIA:TYPE=AUDIO')) {
                            if (/DEFAULT=YES/i.test(linea)) {
                                if (audioDefaultAsignado) linea = linea.replace(/DEFAULT=YES/i, 'DEFAULT=NO');
                                else audioDefaultAsignado = true;
                            }
                        }
                        salida.push(linea);
                    }
                    return salida.join('\n');
                };

                class BlazarMasterLoader extends Hls.DefaultConfig.loader {
                    load(context, config, callbacks) {
                        const originalSuccess = callbacks.onSuccess;
                        callbacks.onSuccess = (response, stats, ctx, networkDetails) => {
                            if (context.type === 'manifest' && typeof response.data === 'string' && response.data.includes('#EXTM3U')) {
                                response.data = normalizarMasterEnMemoria(response.data);
                            }
                            originalSuccess(response, stats, ctx, networkDetails);
                        };
                        return super.load(context, config, callbacks);
                    }
                }

                this.hls = new Hls({
                    loader: BlazarMasterLoader,
                    debug: false,
                    xhrSetup: function (xhr, url) {
                        let newUrl = url;
                        if (newUrl.includes('example.com')) {
                            const keyFilename = newUrl.substring(newUrl.lastIndexOf('/') + 1);
                            newUrl = baseUrl + keyFilename.replace('.key', '_aes.key');
                        }
                        if (sasToken && !newUrl.includes('sig=')) {
                            const separador = newUrl.includes('?') ? '&' : '?';
                            newUrl = newUrl + separador + sasToken;
                        }
                        xhr.open('GET', newUrl, true);
                    }
                });

                this.hls.attachMedia(this.video);

                this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    const audioVal = this.blackHole.querySelector('#bh-audio-val');
                    if (audioVal && this.hls.audioTracks && this.hls.audioTracks.length > 0) {
                        const currentTrack = this.hls.audioTracks[this.hls.audioTrack || 0];
                        audioVal.innerText = currentTrack.name || currentTrack.lang || 'Español';
                    }

                    try {
                        const query = sasToken ? ('?' + sasToken) : '';
                        const trackSpa = document.createElement('track');
                        trackSpa.kind = 'subtitles';
                        trackSpa.label = 'Español';
                        trackSpa.srclang = 'es';
                        trackSpa.src = baseUrl + 'subtitulo_0.vtt' + query;
                        trackSpa.default = true;

                        while (this.video.firstChild) { this.video.removeChild(this.video.firstChild); }
                        this.video.appendChild(trackSpa);

                        trackSpa.addEventListener('load', () => { 
                            trackSpa.track.mode = 'showing'; 
                            const subsVal = this.blackHole.querySelector('#bh-subs-val');
                            if (subsVal) subsVal.innerText = 'Español';
                        });
                    } catch(err) { }
                });

                this.hls.on(Hls.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) this.hls.startLoad();
                        else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                            if (data.details === 'bufferAppendError' && typeof this.hls.swapAudioCodec === 'function') {
                                this.hls.swapAudioCodec();
                            }
                            this.hls.recoverMediaError();
                        }
                    }
                });
                this.hls.loadSource(this.videoSrc);
            } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
                this.video.src = this.videoSrc;
            }
        } else {
            this.video.src = this.videoSrc;
        }
    }

buildMenus() {
        this.buildBlackHole(); // Construye el de PC
        this.buildWhiteHole(); // Construye el de Móvil
    }
    openSettings(x, y) {
        const wrapper = this.container.querySelector('.blazar-player-wrapper');
        const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
        if (isFs && wrapper) {
            if (this.blackHole && this.blackHole.parentElement !== wrapper) wrapper.appendChild(this.blackHole);
            if (this.whiteHole && this.whiteHole.parentElement !== wrapper) wrapper.appendChild(this.whiteHole);
        }
        if (this.isMobile) {
            // Activa el Warm Hole / White Hole
            if (this.whiteHole) this.whiteHole.classList.add('active');
        } else {
            // Activa el Black Hole original
            this.openBlackHole(x, y);
        }
    }

    closeSettings() {
        if (this.blackHole) this.blackHole.classList.remove('active');
        if (this.whiteHole) this.whiteHole.classList.remove('active');
    }
    buildBlackHole() {
        this.blackHole = document.createElement('div');
        this.blackHole.className = 'black-hole-menu';
        // Responsividad: Evita cortes en pantallas móviles
        this.blackHole.style.maxHeight = '85vh';
        this.blackHole.style.overflowY = 'auto';
        
        this.blackHole.innerHTML = `
            <div class="bh-header" style="display:flex; justify-content:space-between; align-items:center; padding:10px 16px; border-bottom:1px solid rgba(255,255,255,0.1);">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span class="bh-icon" style="font-size:1.3rem;">🦇</span>
                    <span class="bh-title" style="color:#ff00d4; font-weight:900; letter-spacing:1px; margin:0; border:none; padding:0;">BLACK HOLE SETTINGS</span>
                </div>
                <button class="bh-close-btn" style="background:none; border:none; color:#a38ba0; font-size:1.6rem; cursor:pointer;">&times;</button>
            </div>
            
            <div class="bh-section-title" style="font-size:0.7rem; font-weight:800; color:#a38ba0; padding:10px 16px 4px; letter-spacing:1px;">CONTROL DE REPRODUCCIÓN</div>
            <div class="bh-item" id="bh-fs-menu"><span>⛶ Pantalla Completa</span> <span class="bh-val">Auto</span></div>
            <div class="bh-item" id="bh-pip-menu"><span>📺 Imagen en Imagen (PiP)</span> <span class="bh-val">Activar</span></div>
            <div class="bh-item" id="bh-speed"><span>⏩ Velocidad de Reproducción</span> <span class="bh-val" id="bh-speed-val">1.0x</span></div>
            
            <div class="bh-section-title" style="font-size:0.7rem; font-weight:800; color:#a38ba0; padding:10px 16px 4px; letter-spacing:1px;">AUDIO & IDIOMA NATIVO</div>
            <div class="bh-item" id="bh-audio"><span>🗣️ Pista de Audio</span> <span class="bh-val" id="bh-audio-val">Español</span></div>
            <div class="bh-item" id="bh-subs"><span>📝 Subtítulos (CC)</span> <span class="bh-val" id="bh-subs-val">Auto</span></div>
            
            <div class="bh-section-title" style="font-size:0.7rem; font-weight:800; color:#a38ba0; padding:10px 16px 4px; letter-spacing:1px;">CALIBRACIÓN VISUAL ROUSE</div>
            <div class="bh-item" id="bh-aspect"><span>📐 Ajuste de Aspecto</span> <span class="bh-val" id="bh-aspect-val">Original</span></div>
            <div class="bh-item" id="bh-glow"><span>✨ Glow Ambiental</span> <span class="bh-val" id="bh-glow-val">ON</span></div>
            <div class="bh-item" id="bh-lock"><span>🔒 Bloqueo de Pantalla</span> <span class="bh-val">Candado</span></div>
        `;
        document.body.appendChild(this.blackHole);

        this.blackHole.querySelector('.bh-close-btn').addEventListener('click', () => this.closeBlackHole());

        // MÓDULOS DE CONTROL DE REPRODUCCIÓN
        this.blackHole.querySelector('#bh-fs-menu').addEventListener('click', () => {
            this.toggleFullscreen();
            this.closeBlackHole();
        });

        this.blackHole.querySelector('#bh-pip-menu').addEventListener('click', () => {
            this.togglePictureInPicture();
            this.closeBlackHole();
        });

        this.blackHole.querySelector('#bh-speed').addEventListener('click', (e) => {
            let rates = [0.5, 1.0, 1.25, 1.5, 2.0];
            let next = rates[(rates.indexOf(this.video.playbackRate) + 1) % rates.length];
            this.video.playbackRate = next;
            e.currentTarget.querySelector('#bh-speed-val').innerText = next.toFixed(2) + 'x';
            this.showVisualFeedback(`Velocidad: ${next}x`);
        });

        // MÓDULOS DE AUDIO E IDIOMA
        this.blackHole.querySelector('#bh-subs').addEventListener('click', (e) => {
            let tracks = this.video.textTracks;
            if (tracks && tracks.length > 0) {
                let activeIdx = -1;
                for (let i = 0; i < tracks.length; i++) {
                    if (tracks[i].mode === 'showing') activeIdx = i;
                    tracks[i].mode = 'hidden';
                }
                let nextIdx = activeIdx + 1;
                let text = 'OFF';
                if (nextIdx < tracks.length) {
                    tracks[nextIdx].mode = 'showing';
                    text = tracks[nextIdx].label || 'ON';
                }
                e.currentTarget.querySelector('#bh-subs-val').innerText = text;
                this.showVisualFeedback(`Subs: ${text}`);
            }
        });

        this.blackHole.querySelector('#bh-audio').addEventListener('click', (e) => {
            if (this.hls && this.hls.audioTracks && this.hls.audioTracks.length > 0) {
                let next = (this.hls.audioTrack + 1) % this.hls.audioTracks.length;
                this.hls.audioTrack = next;
                let lang = this.hls.audioTracks[next].name || this.hls.audioTracks[next].lang || `Pista ${next + 1}`;
                e.currentTarget.querySelector('#bh-audio-val').innerText = lang;
                this.showVisualFeedback(`Audio: ${lang}`);
            } else {
                this.showVisualFeedback("Audio Único");
            }
        });

        // MÓDULOS DE CALIBRACIÓN VISUAL ROUSE
        this.blackHole.querySelector('#bh-aspect').addEventListener('click', (e) => {
            const fits = ['contain', 'cover', 'fill'];
            const labels = ['Original', 'Recortar', 'Estirar'];
            let current = this.video.style.objectFit || 'contain';
            let nextIdx = (fits.indexOf(current) + 1) % fits.length;
            this.video.style.objectFit = fits[nextIdx];
            e.currentTarget.querySelector('#bh-aspect-val').innerText = labels[nextIdx];
            this.showVisualFeedback(`Aspecto: ${labels[nextIdx]}`);
        });

        this.blackHole.querySelector('#bh-glow').addEventListener('click', (e) => {
            const isOff = this.ambientGlow.style.display === 'none';
            this.ambientGlow.style.display = isOff ? 'block' : 'none';
            const state = isOff ? 'ON' : 'OFF';
            e.currentTarget.querySelector('#bh-glow-val').innerText = state;
            this.showVisualFeedback(`Glow: ${state}`);
        });

        // MÓDULO DE INTERBLOQUEO (CANDADO) desde BlackHole
        this.blackHole.querySelector('#bh-lock').addEventListener('click', () => {
            this.toggleLock();
            this.closeBlackHole();
        });
    }

    openBlackHole(x, y) {
        const menuW = 280;
        const menuH = Math.min(450, window.innerHeight * 0.85);
        let posX = x;
        let posY = y;
        if (posX + menuW > window.innerWidth) posX = window.innerWidth - menuW - 10;
        if (posY + menuH > window.innerHeight) posY = window.innerHeight - menuH - 10;
        if (posX < 0) posX = 10;
        if (posY < 0) posY = 10;
        this.blackHole.style.left = `${posX}px`;
        this.blackHole.style.top = `${posY}px`;
        setTimeout(() => this.blackHole.classList.add('active'), 10);
    }

    closeBlackHole() {
        if (this.blackHole) this.blackHole.classList.remove('active');
    }

    buildWhiteHole() {
        this.whiteHole = document.createElement('div');
        this.whiteHole.className = 'white-hole-menu';
        this.whiteHole.innerHTML = `
            <div class="wh-drag-bar"></div>
            <div class="wh-header">
                <div class="wh-title"><span>🐛</span> WARM HOLE SETTINGS</div>
                <button class="wh-close">&times;</button>
            </div>
            <div class="wh-section">Navegación</div>
            <a href="https://ent.universobdh.me/borvip/" class="wh-item" id="wh-return-home" style="text-decoration:none; color:inherit;">
                <span>🚀 Regresar al Inicio</span>
                <span class="wh-val" style="font-size:0.75rem;">NEW PLANET BLAZAR ON READY</span>
            </a>
            <div class="wh-section">Reproducción</div>
            <div class="wh-item" id="wh-fs-menu"><span>⛶ Pantalla Completa</span> <span class="wh-val">Auto</span></div>
            <div class="wh-item" id="wh-pip-menu"><span>📺 Imagen en Imagen (PiP)</span> <span class="wh-val">Flotante</span></div>
            <div class="wh-item" id="wh-speed"><span>⏩ Velocidad</span> <span class="wh-val" id="wh-speed-val">1.0x</span></div>
            <div class="wh-section">Audio y Subtítulos</div>
            <div class="wh-item" id="wh-audio"><span>🗣️ Audio</span> <span class="wh-val" id="wh-audio-val">Español</span></div>
            <div class="wh-item" id="wh-subs"><span>📝 Subtítulos</span> <span class="wh-val" id="wh-subs-val">Auto</span></div>
            <div class="wh-section">Calibración Táctil</div>
            <div class="wh-item" id="wh-aspect"><span>📐 Aspecto</span> <span class="wh-val" id="wh-aspect-val">Original</span></div>
            <div class="wh-item" id="wh-lock"><span>🔒 Bloqueo Táctil</span> <span class="wh-val">Candado</span></div>
        `;
        document.body.appendChild(this.whiteHole);

        this.whiteHole.querySelector('.wh-close').addEventListener('click', () => this.closeSettings());

        this.whiteHole.querySelector('#wh-fs-menu').addEventListener('click', () => {
            this.toggleFullscreen();
            this.closeSettings();
        });

        const whPip = this.whiteHole.querySelector('#wh-pip-menu');
        if (whPip) {
            whPip.addEventListener('click', () => {
                this.togglePictureInPicture();
                this.closeSettings();
            });
        }

        this.whiteHole.querySelector('#wh-speed').addEventListener('click', (e) => {
            let rates = [0.5, 1.0, 1.25, 1.5, 2.0];
            let next = rates[(rates.indexOf(this.video.playbackRate) + 1) % rates.length];
            this.video.playbackRate = next;
            e.currentTarget.querySelector('#wh-speed-val').innerText = next.toFixed(2) + 'x';
            this.showVisualFeedback(`Velocidad: ${next}x`);
        });

        this.whiteHole.querySelector('#wh-subs').addEventListener('click', (e) => {
            let tracks = this.video.textTracks;
            if (tracks && tracks.length > 0) {
                let activeIdx = -1;
                for (let i = 0; i < tracks.length; i++) {
                    if (tracks[i].mode === 'showing') activeIdx = i;
                    tracks[i].mode = 'hidden';
                }
                let nextIdx = activeIdx + 1;
                let text = 'OFF';
                if (nextIdx < tracks.length) {
                    tracks[nextIdx].mode = 'showing';
                    text = tracks[nextIdx].label || 'ON';
                }
                e.currentTarget.querySelector('#wh-subs-val').innerText = text;
                this.showVisualFeedback(`Subs: ${text}`);
            }
        });

        this.whiteHole.querySelector('#wh-audio').addEventListener('click', (e) => {
            if (this.hls && this.hls.audioTracks && this.hls.audioTracks.length > 0) {
                let next = (this.hls.audioTrack + 1) % this.hls.audioTracks.length;
                this.hls.audioTrack = next;
                let lang = this.hls.audioTracks[next].name || this.hls.audioTracks[next].lang || `Pista ${next + 1}`;
                e.currentTarget.querySelector('#wh-audio-val').innerText = lang;
                this.showVisualFeedback(`Audio: ${lang}`);
            }
        });

        this.whiteHole.querySelector('#wh-aspect').addEventListener('click', (e) => {
            const fits = ['contain', 'cover', 'fill'];
            const labels = ['Original', 'Recortar', 'Estirar'];
            let current = this.video.style.objectFit || 'contain';
            let nextIdx = (fits.indexOf(current) + 1) % fits.length;
            this.video.style.objectFit = fits[nextIdx];
            e.currentTarget.querySelector('#wh-aspect-val').innerText = labels[nextIdx];
            this.showVisualFeedback(`Aspecto: ${labels[nextIdx]}`);
        });

        // BLOQUEO TÁCTIL desde el White Hole — usa toggleLock() unificado
        this.whiteHole.querySelector('#wh-lock').addEventListener('click', () => {
            this.toggleLock();
            this.closeSettings();
        });

        // Swipe down para cerrar
        let touchStartY = 0;
        this.whiteHole.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, {passive: true});
        this.whiteHole.addEventListener('touchend', e => {
            if (e.changedTouches[0].clientY - touchStartY > 50) this.closeSettings();
        }, {passive: true});
    }
    attachHardwareEvents() {
       // 1. EL CAMBIO EN EL DOCUMENT (Clic derecho EN TODA LA PÁGINA)
        this.addTrackedListener(document, 'contextmenu', (e) => {
            if (this.isDestroyed) return;
            
            // Al no limitar el área con closest(), el Black Hole responde en cualquier pixel de la pantalla
            if (!this.isLocked) {
                e.preventDefault();
                this.openSettings(e.clientX, e.clientY);
            }
        });

        // 2. EL CAMBIO EN EL BOTÓN SUPERIOR
        if (this.btnTopBh) this.btnTopBh.addEventListener('click', (e) => {
            if (this.isLocked) return;
            const rect = e.target.getBoundingClientRect();
            this.openSettings(rect.left, rect.bottom + 5); // ANTES DECÍA openBlackHole
        });

        // 3. EL CAMBIO EN EL BOTÓN INFERIOR
        if (this.btnBottomBh) this.btnBottomBh.addEventListener('click', (e) => {
            if (this.isLocked) return;
            const rect = e.target.getBoundingClientRect();
            this.openSettings(rect.left, rect.top - 200); // ANTES DECÍA openBlackHole
        });

        if (this.btnTopPip) this.btnTopPip.addEventListener('click', () => {
            this.togglePictureInPicture();
        });

        if (this.btnTopFs) this.btnTopFs.addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // ESCUCHADORES DE PANTALLA COMPLETA: Reparentar Black Hole, Warm Hole y Ficha Técnica a la Top Layer
        const handleFullscreenChange = () => {
            const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
            const wrapper = this.container.querySelector('.blazar-player-wrapper');
            const fichaPanel = document.getElementById('episodes-content-panel');
            const fichaBackdrop = document.getElementById('ficha-backdrop');

            if (isFs && wrapper) {
                if (this.blackHole && this.blackHole.parentElement !== wrapper) wrapper.appendChild(this.blackHole);
                if (this.whiteHole && this.whiteHole.parentElement !== wrapper) wrapper.appendChild(this.whiteHole);
                if (fichaBackdrop && fichaBackdrop.parentElement !== wrapper) wrapper.appendChild(fichaBackdrop);
                if (fichaPanel && fichaPanel.parentElement !== wrapper) wrapper.appendChild(fichaPanel);
            } else {
                const mainContainer = document.querySelector('.main-container');
                if (mainContainer) {
                    if (fichaBackdrop && fichaBackdrop.parentElement !== mainContainer) mainContainer.appendChild(fichaBackdrop);
                    if (fichaPanel && fichaPanel.parentElement !== mainContainer) mainContainer.appendChild(fichaPanel);
                }
                if (this.blackHole && this.blackHole.parentElement !== document.body) document.body.appendChild(this.blackHole);
                if (this.whiteHole && this.whiteHole.parentElement !== document.body) document.body.appendChild(this.whiteHole);
            }
        };

        this.addTrackedListener(document, 'fullscreenchange', handleFullscreenChange);
        this.addTrackedListener(document, 'webkitfullscreenchange', handleFullscreenChange);

        // 4. EL CAMBIO EN EL DOCUMENT (Clic para cerrar)
        this.addTrackedListener(document, 'click', (e) => {
            if (this.isDestroyed) return;
            // Se debe asegurar que un clic en el White Hole tampoco cierre el menú
            if (!e.target.closest('.black-hole-menu') && 
                !e.target.closest('.white-hole-menu') && 
                !e.target.closest('#btn-top-blackhole') && 
                !e.target.closest('.btn-bh-trigger')) {
                this.closeSettings(); // ANTES DECÍA closeBlackHole
            }
        });

        // MÓDULO DE BLOQUEO DIRECTO (Botón 🔒 en Barra Superior)
        const btnTopLock = this.container.querySelector('#btn-top-lock');
        if (btnTopLock) {
            btnTopLock.addEventListener('click', () => {
                this.toggleLock();
            });
        }

        // GATILLOS DE TEMA ROUSE (🐎 Corcel Dorado y 🐉 Dragón Rosa)
        const btnTopGold = this.container.querySelector('#btn-top-gold');
        if (btnTopGold) {
            btnTopGold.addEventListener('click', () => {
                const radio = document.getElementById('theme-gold');
                if (radio) {
                    radio.checked = true;
                    radio.dispatchEvent(new Event('change', { bubbles: true }));
                }
                this.showVisualFeedback("Tema: Corcel Dorado 🐎");
            });
        }

        const btnTopPink = this.container.querySelector('#btn-top-pink');
        if (btnTopPink) {
            btnTopPink.addEventListener('click', () => {
                const radio = document.getElementById('theme-pink');
                if (radio) {
                    radio.checked = true;
                    radio.dispatchEvent(new Event('change', { bubbles: true }));
                }
                this.showVisualFeedback("Tema: Dragón Eléctrico 🐉");
            });
        }

        // DESBLOQUEO DE CANDADO: Doble toque rápido sobre el indicador
        let lastLockTap = 0;
        this.lockIndicator.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const now = Date.now();
            if (now - lastLockTap < 400) {
                this.toggleLock(false); // Forzar desbloqueo
            }
            lastLockTap = now;
        });
        // Clic en el indicador también desbloquea (escritorio)
        this.lockIndicator.addEventListener('click', () => {
            if (this.isLocked) this.toggleLock(false);
        });

        let ultimoToque = 0;
        this.shield.addEventListener('touchstart', (e) => {
            if (this.isLocked) return; // BLOQUEO ACTIVO: Ignora gestos
            
            const tiempoActual = Date.now();
            const duracionToque = tiempoActual - ultimoToque;
            if (duracionToque < 300 && duracionToque > 0) {
                e.preventDefault();
                const rect = this.shield.getBoundingClientRect();
                if (e.changedTouches[0].clientX - rect.left < rect.width / 2) {
                    this.video.currentTime -= 10;
                    this.showVisualFeedback("<< 10s");
                } else {
                    this.video.currentTime += 10;
                    this.showVisualFeedback(">> 10s");
                }
            } else {
                setTimeout(() => { if (Date.now() - ultimoToque >= 300 && !this.isLocked) this.togglePlay(); }, 300);
            }
            ultimoToque = tiempoActual;
        }, { passive: false });

        // =========================================================================
        // ESCUDO TOTAL DE RATÓN GAMER: BOTONES LATERALES (XBUTTON1 / XBUTTON2)
        // Bloqueo absoluto de navegación nativa (Atrás / Adelante) y salto de 10s
        // =========================================================================
        let lastGamerSeekTimestamp = 0;

        const executeGamerSeek = (seconds) => {
            const now = Date.now();
            if (now - lastGamerSeekTimestamp < 350) return; // Debounce contra disparo doble
            lastGamerSeekTimestamp = now;

            if (this.isLocked || this.isDestroyed || !this.video) return;

            if (seconds < 0) {
                this.video.currentTime = Math.max(0, this.video.currentTime - 10);
                this.showVisualFeedback("<< 10s");
            } else {
                const maxTime = this.video.duration || (this.video.currentTime + 10);
                this.video.currentTime = Math.min(maxTime, this.video.currentTime + 10);
                this.showVisualFeedback(">> 10s");
            }
        };

        const handleGamerMouseAction = (e) => {
            const isBackBtn = (e.button === 3 || (e.buttons && (e.buttons & 8)));
            const isFwdBtn  = (e.button === 4 || (e.buttons && (e.buttons & 16)));
            if (!isBackBtn && !isFwdBtn) return;

            // Anular navegación nativa y propagación a nivel ventana y documento
            e.preventDefault();
            e.stopPropagation();
            if (e.stopImmediatePropagation) e.stopImmediatePropagation();

            // Ejecutar el salto en el inicio de la pulsación
            if (e.type === 'mousedown' || e.type === 'pointerdown') {
                if (isBackBtn) executeGamerSeek(-10);
                else if (isFwdBtn) executeGamerSeek(10);
            }
        };

        const gamerEvents = ['mousedown', 'mouseup', 'pointerdown', 'pointerup', 'auxclick', 'click'];
        gamerEvents.forEach(evt => {
            this.addTrackedListener(window, evt, handleGamerMouseAction, { capture: true, passive: false });
            this.addTrackedListener(document, evt, handleGamerMouseAction, { capture: true, passive: false });
        });

        // TRAMPA DUAL DE HISTORIAL (ANTI-NAVEGACIÓN POR HARDWARE EN WINDOWS/CHROME)
        // Previene que Windows o drivers envíen comandos directos de historial (WM_APPCOMMAND)
        try {
            const curUrl = window.location.href;
            history.pushState({ bdhGuard: 'back' }, '', curUrl);
            history.pushState({ bdhGuard: 'main' }, '', curUrl);
            history.pushState({ bdhGuard: 'forward' }, '', curUrl);
            history.back(); // Sitúa la posición en 'main'
        } catch(err) {}

        const handleHistoryGuardPopstate = (e) => {
            if (this.isDestroyed) return;
            if (e.state && e.state.bdhGuard) {
                if (e.state.bdhGuard === 'back') {
                    // Intento de ir Atrás: rebotar de inmediato a 'main'
                    try { history.forward(); } catch(err) {}
                    executeGamerSeek(-10);
                } else if (e.state.bdhGuard === 'forward') {
                    // Intento de ir Adelante: rebotar de inmediato a 'main'
                    try { history.back(); } catch(err) {}
                    executeGamerSeek(10);
                }
            }
        };
        this.addTrackedListener(window, 'popstate', handleHistoryGuardPopstate, { capture: true });

        // CONTROL DE VOLUMEN CON RUEDA DEL RATÓN
        this.container.addEventListener('wheel', (e) => {
            if (this.isLocked) return;
            e.preventDefault();
            let vol = this.video.volume;
            if (e.deltaY < 0) vol = Math.min(1, vol + 0.1);
            else vol = Math.max(0, vol - 0.1);
            this.video.volume = vol;
            this.video.muted = (vol === 0);
            if (this.btnVol) this.btnVol.innerText = this.video.muted ? "🔇" : "🔊";
            if (this.volSlider) this.volSlider.value = vol;
            this.showVisualFeedback(`Volumen: ${Math.round(vol * 100)}%`);
        }, { passive: false });
        
        // CONTROL MAESTRO DE TECLADO
        this.addTrackedListener(document, 'keydown', (e) => {
            if (this.isDestroyed || this.isLocked) return;
            if (e.code === 'Enter') { e.preventDefault(); this.togglePlay(); }
            if (e.code === 'ArrowRight') { e.preventDefault(); this.video.currentTime += 10; this.showVisualFeedback(">> 10s"); }
            if (e.code === 'ArrowLeft') { e.preventDefault(); this.video.currentTime -= 10; this.showVisualFeedback("<< 10s"); }
            if (e.code === 'ArrowUp') {
                e.preventDefault();
                this.video.volume = Math.min(1, this.video.volume + 0.1);
                this.video.muted = (this.video.volume === 0);
                if (this.btnVol) this.btnVol.innerText = this.video.muted ? "🔇" : "🔊";
                if (this.volSlider) this.volSlider.value = this.video.volume;
                this.showVisualFeedback(`Volumen: ${Math.round(this.video.volume * 100)}%`);
            }
            if (e.code === 'ArrowDown') {
                e.preventDefault();
                this.video.volume = Math.max(0, this.video.volume - 0.1);
                this.video.muted = (this.video.volume === 0);
                if (this.btnVol) this.btnVol.innerText = this.video.muted ? "🔇" : "🔊";
                if (this.volSlider) this.volSlider.value = this.video.volume;
                this.showVisualFeedback(`Volumen: ${Math.round(this.video.volume * 100)}%`);
            }
        });

        // ============================================================
        // SISTEMA UNIFICADO DE BURBUJAS / TOOLTIPS CENTRADAS (UNIVERSO BDH)
        // En CUALQUIER pantalla (PC y Móvil), la burbuja se ve ENMEDIO:
        // - En Computadora (ratón):
        //     * Hover (pasar cursor) -> Muestra la burbuja enmedio
        //     * Mouseleave -> Oculta la burbuja
        //     * Clic -> Se ejecuta AL PRIMER CLIC (sin doble clic)
        // - En Celular (pantalla táctil):
        //     * 1er toque -> Muestra la burbuja enmedio (no abre la función)
        //     * 2do toque (en el mismo botón) -> Abre la función del botón
        //     * Toque fuera -> Oculta la burbuja y cancela el armado
        // ============================================================
        const wrapper = this.container.querySelector('.blazar-player-wrapper') || this.container;
        this.tooltipOverlay = wrapper.querySelector('#blazar-tooltip-overlay');
        if (!this.tooltipOverlay) {
            this.tooltipOverlay = document.createElement('div');
            this.tooltipOverlay.id = 'blazar-tooltip-overlay';
            wrapper.appendChild(this.tooltipOverlay);
        }

        let tooltipTimer = null;
        const showBubble = (text) => {
            if (!this.tooltipOverlay || !text) return;
            this.tooltipOverlay.innerText = text;
            this.tooltipOverlay.classList.add('visible');
            clearTimeout(tooltipTimer);
            tooltipTimer = setTimeout(() => hideBubble(), 2500);
        };

        const hideBubble = () => {
            if (!this.tooltipOverlay) return;
            this.tooltipOverlay.classList.remove('visible');
            clearTimeout(tooltipTimer);
        };

        // Detector de interacción táctil en tiempo real
        let lastTouchTimestamp = 0;
        this.addTrackedListener(document, 'touchstart', () => {
            if (this.isDestroyed) return;
            lastTouchTimestamp = Date.now();
        }, { passive: true, capture: true });

        const isTouchMode = () => (Date.now() - lastTouchTimestamp < 800);

        let armedBtn = null;
        let armTimer = null;

        const disarmBtn = () => {
            if (armedBtn) {
                armedBtn.classList.remove('touch-armed');
                armedBtn = null;
            }
            clearTimeout(armTimer);
            hideBubble();
        };

        const tooltipButtons = document.querySelectorAll('[data-tooltip]');
        tooltipButtons.forEach(btn => {
            const text = btn.getAttribute('data-tooltip');

            // 1. ESCRITORIO / RATÓN (Hover):
            btn.addEventListener('mouseenter', () => {
                if (isTouchMode()) return; // Ignorar si proviene de interacción táctil
                showBubble(text);
            });

            btn.addEventListener('mouseleave', () => {
                if (isTouchMode()) return;
                hideBubble();
            });

            // 2. INTERCEPTOR DE CLIC / TOQUE:
            // Usamos capture: true para interceptar antes de que el botón ejecute su acción
            btn.addEventListener('click', (e) => {
                const touchActive = isTouchMode();

                // EN COMPUTADORA (Ratón):
                if (!touchActive) {
                    // En computadora es al click directo (1 solo clic).
                    // Ocultamos la burbuja si estaba abierta y dejamos que el clic fluya directamente.
                    hideBubble();
                    return;
                }

                // EN CELULAR (Pantalla táctil):
                if (armedBtn !== btn) {
                    // PRIMER TOQUE:
                    // Mostrar globo explicativo enmedio y NO abrir la función
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();

                    if (armedBtn) armedBtn.classList.remove('touch-armed');
                    armedBtn = btn;
                    btn.classList.add('touch-armed');
                    showBubble(text);

                    clearTimeout(armTimer);
                    armTimer = setTimeout(() => {
                        disarmBtn();
                    }, 2500);
                    return;
                }

                // SEGUNDO TOQUE:
                // En el mismo botón mientras está armado -> Ahora sí se ejecuta la función
                clearTimeout(armTimer);
                btn.classList.remove('touch-armed');
                armedBtn = null;
                hideBubble();
                // No detenemos el evento: fluye normalmente a la función del botón
            }, { capture: true });
        });

        // Toque o clic fuera de botones con tooltip -> Cerrar burbuja y desarmar
        this.addTrackedListener(document, 'click', (e) => {
            if (this.isDestroyed) return;
            if (!e.target.closest('[data-tooltip]')) {
                disarmBtn();
            }
        });
        this.addTrackedListener(document, 'touchstart', (e) => {
            if (this.isDestroyed) return;
            if (!e.target.closest('[data-tooltip]')) {
                disarmBtn();
            }
        }, { passive: true });

        this.shield.addEventListener('click', (e) => {
            if (this.isLocked) return;
            if (e.button === 0 && !(/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent))) this.togglePlay();
        });
    }

    attachSecurityProtocols() {
        this.addTrackedListener(document, 'visibilitychange', () => {
            if (this.isDestroyed) return;
            if (this.video) this.video.style.filter = document.hidden ? 'brightness(0)' : 'none';
        });
    }

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '00:00';
        let h = Math.floor(seconds / 3600);
        let m = Math.floor((seconds % 3600) / 60); 
        let s = Math.floor(seconds % 60);
        if (h > 0) {
            return `${h}:${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
        }
        return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    }

    // =========================================================================
    // MEMORIA DE REPRODUCCIÓN EN NAVEGADOR (CON PROTOCOLO DE BORRADO PRUDENTE)
    // =========================================================================
    getSavedPlaybackPosition(mediaKey) {
        if (!mediaKey) return 0;
        try {
            const memory = JSON.parse(localStorage.getItem('bdh_blazar_playback_memory')) || {};
            const item = memory[mediaKey];
            if (item && item.time > 5) {
                // Si ya estaba en los últimos 20 segundos de la película o capítulo, reiniciar
                if (item.duration && item.time >= item.duration - 20) return 0;
                return item.time;
            }
        } catch(e) {}
        return 0;
    }

    savePlaybackPosition(time, duration) {
        if (!this.currentMediaKey || isNaN(time) || time < 5) return;
        let memory = {};
        try {
            memory = JSON.parse(localStorage.getItem('bdh_blazar_playback_memory')) || {};
        } catch(e) { memory = {}; }

        // Si ya está terminado o al final (últimos 20s o 95%), purgar el registro
        if (duration && (time >= duration - 20 || (time / duration) > 0.95)) {
            if (memory[this.currentMediaKey]) {
                delete memory[this.currentMediaKey];
                try {
                    localStorage.setItem('bdh_blazar_playback_memory', JSON.stringify(memory));
                } catch(e) {}
            }
            return;
        }

        memory[this.currentMediaKey] = {
            id: this.currentMediaKey,
            title: this.currentMediaTitle || '',
            series: this.currentMediaSeries || '',
            time: Math.floor(time),
            duration: Math.floor(duration || 0),
            updatedAt: Date.now()
        };

        // PROTOCOLO DE BORRADO PRUDENTE (No saturar ni borrar demasiado rápido)
        // 1. Descartar registros con más de 45 días sin interacción
        const limiteTiempoMs = 45 * 24 * 60 * 60 * 1000;
        const ahora = Date.now();
        for (const k of Object.keys(memory)) {
            if (ahora - (memory[k].updatedAt || 0) > limiteTiempoMs) {
                delete memory[k];
            }
        }

        // 2. Limitar a máximo 60 contenidos (guardar los 50 más recientes para uso óptimo de memoria)
        const claves = Object.keys(memory);
        if (claves.length > 60) {
            claves.sort((a, b) => (memory[b].updatedAt || 0) - (memory[a].updatedAt || 0));
            const podado = {};
            for (let i = 0; i < 50; i++) {
                podado[claves[i]] = memory[claves[i]];
            }
            memory = podado;
        }

        try {
            localStorage.setItem('bdh_blazar_playback_memory', JSON.stringify(memory));
        } catch(e) {
            console.warn("Alerta: almacenamiento local lleno para progreso de reproducción");
        }
    }

    clearPlaybackPosition(mediaKey) {
        if (!mediaKey) return;
        try {
            const memory = JSON.parse(localStorage.getItem('bdh_blazar_playback_memory')) || {};
            if (memory[mediaKey]) {
                delete memory[mediaKey];
                localStorage.setItem('bdh_blazar_playback_memory', JSON.stringify(memory));
            }
        } catch(e) {}
    }

    checkAndResumePlayback() {
        if (this.hasResumedCurrentSource || !this.currentMediaKey) return;
        const savedPos = this.getSavedPlaybackPosition(this.currentMediaKey);
        if (savedPos > 5) {
            this.hasResumedCurrentSource = true;
            try {
                this.video.currentTime = savedPos;
                this.showVisualFeedback(`▶ Reanudando en ${this.formatTime(savedPos)}`);
            } catch(e) {}
        } else {
            this.hasResumedCurrentSource = true;
        }
    }

    attachMediaEvents() {
        // Restauración automática al cargar metadatos de video
        this.video.addEventListener('loadedmetadata', () => {
            this.checkAndResumePlayback();
        });

        this.video.addEventListener('canplay', () => {
            this.checkAndResumePlayback();
        });

        this.video.addEventListener('timeupdate', () => {
            // Si el usuario está arrastrando la barra, NO sobrescribir la interfaz con el tiempo actual del video
            if (this.isUserSeeking || !this.video.duration) return;

            const progress = (this.video.currentTime / this.video.duration) * 100;
            this.progressBar.value = progress;
            this.progressFilled.style.width = `${progress}%`;
            this.timeDisplay.innerText = `${this.formatTime(this.video.currentTime)} / ${this.formatTime(this.video.duration)}`;

            // Guardar posición periódicamente (cada 3.5 segundos) con borrado prudente
            const now = Date.now();
            if (now - this.lastSaveTimestamp > 3500) {
                this.lastSaveTimestamp = now;
                this.savePlaybackPosition(this.video.currentTime, this.video.duration);
            }
        });

        this.video.addEventListener('pause', () => {
            this.btnPlay.innerText = "▶";
            this.savePlaybackPosition(this.video.currentTime, this.video.duration);
        });

        this.video.addEventListener('play', () => {
            this.btnPlay.innerText = "❚❚";
        });

        this.video.addEventListener('ended', () => {
            this.btnPlay.innerText = "▶";
            this.clearPlaybackPosition(this.currentMediaKey);
        });

        this.addTrackedListener(window, 'beforeunload', () => {
            if (this.isDestroyed) return;
            if (this.video && this.video.currentTime > 5) {
                this.savePlaybackPosition(this.video.currentTime, this.video.duration);
            }
        });

        // =========================================================================
        // CONTROLADOR DE LÍNEA DE TIEMPO DUAL-STATE (NETFLIX / YOUTUBE STYLE)
        // Desacopla la renderización visual fluida en el DOM (input) de la
        // instrucción real de decodificación de saltos (change / release)
        // =========================================================================
        const commitSeek = () => {
            if (!this.video.duration || this.isDestroyed) {
                this.detachSeekDragListeners();
                return;
            }
            clearTimeout(this.seekThrottleTimer);
            this.seekThrottleTimer = null;

            const targetTime = (parseFloat(this.progressBar.value) / 100) * this.video.duration;
            
            // Asigna el salto directo al decodificador de video
            this.video.currentTime = targetTime;
            this.isUserSeeking = false;
            this.pendingSeekTime = null;
            this.lastSeekTime = 0;

            // Desvincular de inmediato los escuchadores globales de liberación
            this.detachSeekDragListeners();

            // Sincronizar UI final
            this.progressFilled.style.width = `${this.progressBar.value}%`;
            this.timeDisplay.innerText = `${this.formatTime(targetTime)} / ${this.formatTime(this.video.duration)}`;

            // Guardar en memoria de inmediato
            this.savePlaybackPosition(targetTime, this.video.duration);
        };

        // 1. EVENTO INPUT: Renderizado ultra ligero del DOM (solo UI, sin tocar currentTime)
        this.progressBar.addEventListener('input', (e) => {
            if (this.isLocked || !this.video.duration || this.isDestroyed) return;

            // Congelar actualización automática desde timeupdate y enganchar listeners dinámicos de liberación
            this.isUserSeeking = true;
            this.attachSeekDragListeners(commitSeek);

            const pct = parseFloat(e.target.value);
            const tempTime = (pct / 100) * this.video.duration;
            this.pendingSeekTime = tempTime;

            // Actualización inmediata EXCLUSIVAMENTE visual (UI)
            this.progressFilled.style.width = `${pct}%`;
            this.timeDisplay.innerText = `${this.formatTime(tempTime)} / ${this.formatTime(this.video.duration)}`;

            // 2. OPTIMIZADOR CON THROTTLING A 100ms PARA PREVIEWS FLUIDAS SIN COLAPSO DE BUFFER
            const now = performance.now();
            if (!this.lastSeekTime || (now - this.lastSeekTime >= 100)) {
                this.lastSeekTime = now;
                if (Math.abs(this.video.currentTime - tempTime) > 0.5) {
                    this.video.currentTime = tempTime;
                }
            } else {
                // Debounce para asegurar el procesamiento del último marco si el usuario se detiene
                clearTimeout(this.seekThrottleTimer);
                this.seekThrottleTimer = setTimeout(() => {
                    if (this.isUserSeeking && this.pendingSeekTime !== null && !this.isDestroyed) {
                        this.lastSeekTime = performance.now();
                        this.video.currentTime = this.pendingSeekTime;
                    }
                }, 100);
            }
        });

        // Enganchar listeners dinámicos al iniciar arrastre con ratón o toque
        this.progressBar.addEventListener('mousedown', () => {
            if (!this.isLocked && !this.isDestroyed) {
                this.isUserSeeking = true;
                this.attachSeekDragListeners(commitSeek);
            }
        });

        this.progressBar.addEventListener('touchstart', () => {
            if (!this.isLocked && !this.isDestroyed) {
                this.isUserSeeking = true;
                this.attachSeekDragListeners(commitSeek);
            }
        }, { passive: true });

        // 3. EVENTOS CHANGE / MOUSEUP / TOUCHEND en la barra
        this.progressBar.addEventListener('change', () => {
            if (this.isLocked || this.isDestroyed) return;
            commitSeek();
        });

        this.progressBar.addEventListener('mouseup', () => {
            if (this.isLocked || this.isDestroyed) return;
            commitSeek();
        });

        this.progressBar.addEventListener('touchend', () => {
            if (this.isLocked || this.isDestroyed) return;
            commitSeek();
        });

        this.btnPlay.addEventListener('click', () => { if (!this.isLocked) this.togglePlay(); });

        this.btnVol.addEventListener('click', () => {
            if (this.isLocked) return;
            this.video.muted = !this.video.muted;
            if (!this.video.muted && this.video.volume === 0) this.video.volume = 1.0;
            this.btnVol.innerText = this.video.muted ? "🔇" : "🔊";
            this.volSlider.value = this.video.muted ? 0 : this.video.volume;
        });

        this.volSlider.addEventListener('input', (e) => {
            if (this.isLocked) return;
            this.video.volume = e.target.value;
            this.video.muted = (this.video.volume === 0);
            this.btnVol.innerText = this.video.muted ? "🔇" : "🔊";
        });

        // Al primer toque o clic en el reproductor, desmutear si inició en silencio por autoplay
        const desmutearAlInteractuar = () => {
            if (this.video && this.video.muted) {
                this.video.muted = false;
                this.video.volume = 1.0;
                this.btnVol.innerText = "🔊";
                this.volSlider.value = 1.0;
            }
            this.container.removeEventListener('click', desmutearAlInteractuar);
            this.container.removeEventListener('touchstart', desmutearAlInteractuar);
        };
        this.container.addEventListener('click', desmutearAlInteractuar, { passive: true });
        this.container.addEventListener('touchstart', desmutearAlInteractuar, { passive: true });

        let inactividadTimer;
        this.container.addEventListener('mousemove', () => {
            if (this.isLocked) return;
            
            this.container.style.cursor = 'default';
            if (this.controlsUi) this.controlsUi.style.opacity = '1';
            if (this.topBarUi) this.topBarUi.style.opacity = '1';
            
            clearTimeout(inactividadTimer);
            inactividadTimer = setTimeout(() => {
                if (document.fullscreenElement || (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent))) {
                    this.container.style.cursor = 'none';
                    if (this.controlsUi) this.controlsUi.style.opacity = '0';
                    if (this.topBarUi) this.topBarUi.style.opacity = '0';
                }
            }, 2500);
        });
    }

    togglePlay(forcePlay = false) {
        if (this.video.muted && forcePlay) { 
            this.video.muted = false; 
            this.video.volume = 1.0; 
            this.btnVol.innerText = "🔊"; 
        }
        if (this.video.paused || forcePlay) {
            const playPromise = this.video.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    this.btnPlay.innerText = "❚❚";
                }).catch(() => {
                    // Si el navegador bloquea autoplay con sonido, iniciar silenciado para cumplir con la política
                    if (forcePlay && !this.video.muted) {
                        this.video.muted = true;
                        this.btnVol.innerText = "🔇";
                        this.video.play().then(() => {
                            this.btnPlay.innerText = "❚❚";
                            this.showVisualFeedback("🔊 Toca para activar audio");
                        }).catch(()=>{});
                    }
                });
            }
        } else {
            this.video.pause();
            this.btnPlay.innerText = "▶";
        }
    }

    /**
     * toggleLock — Método unificado de bloqueo/desbloqueo
     * @param {boolean|undefined} forceLock - true=bloquear, false=desbloquear, undefined=alternar
     */
    toggleLock(forceLock) {
        if (forceLock === undefined) forceLock = !this.isLocked;
        this.isLocked = forceLock;

        if (this.isLocked) {
            // BLOQUEAR
            if (this.controlsUi) this.controlsUi.style.opacity = '0';
            if (this.topBarUi)   this.topBarUi.style.opacity   = '0';
            this.lockIndicator.classList.remove('lock-hidden');
            this.lockIndicator.style.display = ''; // Restablecer si fue ocultado via style
            this.showVisualFeedback("🔒 Controles Bloqueados");
            this.closeSettings();
        } else {
            // DESBLOQUEAR
            this.lockIndicator.classList.add('lock-hidden');
            this.lockIndicator.style.display = '';
            this.showVisualFeedback("🔓 Desbloqueado");
            this.closeSettings();
        }
    }

    /**
     * togglePictureInPicture — Imagen en Imagen (PiP) Nativo del Sistema Operativo
     * Hace flotar la ventana de video fuera de la pestaña del navegador (soporta Android, iOS y PC).
     */
    async togglePictureInPicture() {
        if (!this.video || this.isLocked || this.isDestroyed) return;

        // 1. Si ya hay una ventana PiP abierta en el navegador, salir de ella
        if (document.pictureInPictureElement) {
            try {
                await document.exitPictureInPicture();
                this.showVisualFeedback("📺 PiP Desactivado");
            } catch (err) {
                console.warn("Error al salir de PiP:", err);
            }
            return;
        }

        // 2. Soporte nativo para Safari en iOS / iPadOS (Webkit Presentation Mode)
        if (this.video.webkitSupportsPresentationMode && typeof this.video.webkitSetPresentationMode === 'function') {
            try {
                const currentMode = this.video.webkitPresentationMode;
                const targetMode = currentMode === 'picture-in-picture' ? 'inline' : 'picture-in-picture';
                this.video.webkitSetPresentationMode(targetMode);
                this.showVisualFeedback(targetMode === 'picture-in-picture' ? "📺 PiP Flotante Activo" : "📺 PiP Desactivado");
                return;
            } catch (err) {
                console.warn("Error PiP iOS:", err);
            }
        }

        // 3. Soporte estándar W3C (Android Chrome/Edge/Samsung Internet y PC Chrome/Edge/Firefox/Opera)
        if (document.pictureInPictureEnabled || this.video.requestPictureInPicture) {
            try {
                if (this.video.readyState === 0) {
                    this.showVisualFeedback("⚠️ Reproduce el video para activar PiP");
                    return;
                }
                await this.video.requestPictureInPicture();
                this.showVisualFeedback("📺 PiP Flotante Activo");
                return;
            } catch (err) {
                console.warn("PiP nativo rechazado:", err);
                if (err.name === 'NotAllowedError') {
                    this.showVisualFeedback("⚠️ Toca para permitir ventana PiP");
                } else {
                    this.showVisualFeedback("⚠️ PiP no disponible en este video");
                }
                return;
            }
        }

        // 4. Si el navegador o dispositivo no soporta PiP nativo
        this.showVisualFeedback("⚠️ Dispositivo sin PiP nativo");
    }

    /**
     * toggleFullscreen — Pantalla Completa Bidireccional
     * Mueve dinámicamente los menús Black Hole, Warm Hole y la Ficha Técnica dentro de la capa fullscreen
     */
    toggleFullscreen() {
        if (this.isLocked || this.isDestroyed) return;
        const wrapper = this.container.querySelector('.blazar-player-wrapper');
        if (!wrapper) return;

        const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
        if (!isFs) {
            // Pre-reparentar menús y ficha técnica dentro del wrapper para que pertenezcan a la Top Layer
            const fichaPanel = document.getElementById('episodes-content-panel');
            const fichaBackdrop = document.getElementById('ficha-backdrop');
            if (this.blackHole && this.blackHole.parentElement !== wrapper) wrapper.appendChild(this.blackHole);
            if (this.whiteHole && this.whiteHole.parentElement !== wrapper) wrapper.appendChild(this.whiteHole);
            if (fichaBackdrop && fichaBackdrop.parentElement !== wrapper) wrapper.appendChild(fichaBackdrop);
            if (fichaPanel && fichaPanel.parentElement !== wrapper) wrapper.appendChild(fichaPanel);

            if (wrapper.requestFullscreen) {
                wrapper.requestFullscreen().catch(err => console.warn("Fullscreen error:", err));
            } else if (wrapper.webkitRequestFullscreen) {
                wrapper.webkitRequestFullscreen();
            } else if (this.video && this.video.webkitEnterFullscreen) {
                this.video.webkitEnterFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(err => console.warn("Exit fullscreen error:", err));
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }

    showVisualFeedback(text) {
        let old = this.container.querySelector('.v-feedback');
        if (old) old.remove();
        const feedback = document.createElement('div');
        feedback.className = 'v-feedback';
        feedback.innerText = text;
        this.container.querySelector('.blazar-player-wrapper').appendChild(feedback);
        setTimeout(() => feedback.remove(), 900);
    }

    /**
     * destroy — Limpieza total de ciclo de vida (anti-fugas de memoria en SPA)
     * Desvincula escuchadores globales, cancela temporizadores y destruye el motor HLS.
     */
    destroy() {
        this.isDestroyed = true;
        this.isUserSeeking = false;
        this.detachSeekDragListeners();
        clearTimeout(this.seekThrottleTimer);

        if (this.trackedListeners && this.trackedListeners.length > 0) {
            this.trackedListeners.forEach(({ target, type, handler, options }) => {
                try {
                    target.removeEventListener(type, handler, options);
                } catch(e) {}
            });
            this.trackedListeners = [];
        }

        if (this.hls) {
            try { this.hls.destroy(); } catch(e) {}
            this.hls = null;
        }

        if (this.video) {
            try {
                this.video.pause();
                this.video.removeAttribute('src');
                this.video.load();
            } catch(e) {}
        }

        if (this.whiteHole && this.whiteHole.parentNode) {
            this.whiteHole.parentNode.removeChild(this.whiteHole);
        }
        if (this.blackHole && this.blackHole.parentNode) {
            this.blackHole.parentNode.removeChild(this.blackHole);
        }
    }
}

