// ---------------------------------------------------------
// CONTROL VISUAL DEL PERFIL Y AVATARES
// ---------------------------------------------------------

window.actualizarInterfazPerfil = function (identidad, sesionActiva) {
    const btnLoginView = document.getElementById('bdh-btn-login-view');
    const profileView = document.getElementById('bdh-profile-view');
    const compactProfile = document.querySelector('.bdh-compact-profile');

    // IDs del chat-bubble en el header
    const bubUser = document.getElementById('gx-bubble-username');
    const bubImg = document.getElementById('gx-bubble-img');
    const navUser = document.getElementById('bdh-nav-username');
    const navImg = document.getElementById('bdh-nav-avatar');

    // Modal de perfil (si existe)
    const modalUsername = document.getElementById('bdh-modal-username');
    const modalAvatar = document.getElementById('bdh-modal-avatar-grande');
    const optionsUsername = document.getElementById('bdh-options-username');
    const optionsAvatar = document.getElementById('bdh-options-avatar');
    const optionsStatus = document.getElementById('bdh-options-status');

    const avatarUrl = localStorage.getItem('bdh_vip_avatar') ||
        'https://ragnarokmedia.blob.core.windows.net/0010010110110110/%F0%9F%96%BCGALERIAS/%F0%9F%8C%80NEOGROUNDS.PLO/GV.png?sp=r&st=2026-09-25T20:51:50Z&se=2027-09-26T05:06:50Z&sv=2026-02-06&sr=c&sig=6NCuDi%2FQRTymkk959lCGT9RHQbrS1HmVrayem5VU5Kg%3D';

    if (identidad && sesionActiva) {
        // Transformar la burbuja: ocultar botón de login, mostrar solo avatar + nombre con borde naranja
        if (compactProfile) {
            compactProfile.classList.add('is-logged');
            compactProfile.title = 'Abrir opciones del perfil (' + identidad.split('@')[0] + ')';
        }
        if (btnLoginView) {
            btnLoginView.style.display = 'none';
            btnLoginView.classList.add('bdh-hidden');
        }
        if (profileView) {
            profileView.style.display = 'flex';
            profileView.classList.remove('bdh-hidden');
        }

        // Nombre sin la parte @emoji.gms
        const nombreLimpio = identidad.split('@')[0];
        if (bubUser) bubUser.textContent = nombreLimpio;
        if (bubImg && bubImg.src !== avatarUrl) bubImg.src = avatarUrl;
        if (navUser) navUser.textContent = nombreLimpio;
        if (navImg) {
            if (navImg.src !== avatarUrl) navImg.src = avatarUrl;
            navImg.style.borderColor = '#ff4500';
        }
        if (optionsUsername) optionsUsername.textContent = nombreLimpio;
        if (optionsAvatar && optionsAvatar.src !== avatarUrl) optionsAvatar.src = avatarUrl;
        if (optionsStatus) optionsStatus.textContent = 'Conectado';

        // Modal de perfil (si está abierto)
        if (modalUsername) modalUsername.innerText = identidad;
        if (modalAvatar && modalAvatar.src !== avatarUrl) modalAvatar.src = avatarUrl;

    } else {
        if (compactProfile) {
            compactProfile.classList.remove('is-logged');
            compactProfile.title = 'Abrir opciones del perfil';
        }
        if (btnLoginView) {
            btnLoginView.style.display = 'inline-block';
            btnLoginView.classList.remove('bdh-hidden');
        }
        if (profileView) {
            profileView.style.display = 'none';
            profileView.classList.add('bdh-hidden');
        }
        if (optionsStatus) optionsStatus.textContent = 'Sin sesión';
    }
};

window.abrirModalPerfil = function () {
    const modalPerfilOverlay = document.getElementById('bdh-profile-modal-overlay');
    if (modalPerfilOverlay) modalPerfilOverlay.style.display = 'flex';
};

window.cerrarModalPerfil = function () {
    const modalPerfilOverlay = document.getElementById('bdh-profile-modal-overlay');
    if (modalPerfilOverlay) modalPerfilOverlay.style.display = 'none';
    const galeria = document.getElementById('bdh-avatar-gallery');
    if (galeria) galeria.style.display = 'none';
};

window.toggleGaleriaAvatares = function () {
    const galeria = document.getElementById('bdh-avatar-gallery');
    if (galeria) {
        galeria.style.display = galeria.style.display === 'none' ? 'flex' : 'none';
    }
};

window.cerrarCajones = function () {
    const sidebar = document.querySelector('.sidebar');
    const options = document.querySelector('.bdh-right-options');
    const overlay = document.getElementById('bdh-drawer-overlay');
    const chkLeft = document.getElementById('BLACK🦇HOLE');
    const chkRight = document.getElementById('BDH-CONFIG');
    if (sidebar) sidebar.classList.remove('bdh-open');
    if (options) options.classList.remove('bdh-open');
    if (overlay) overlay.classList.remove('active');
    if (chkLeft) chkLeft.checked = false;
    if (chkRight) chkRight.checked = false;
};

window.toggleDescargas = function (event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    const sidebar = document.querySelector('.sidebar');
    const options = document.querySelector('.bdh-right-options');
    const overlay = document.getElementById('bdh-drawer-overlay');
    const chkLeft = document.getElementById('BLACK🦇HOLE');
    const chkRight = document.getElementById('BDH-CONFIG');
    if (!sidebar) return;

    const shouldOpen = !sidebar.classList.contains('bdh-open');
    if (options) options.classList.remove('bdh-open');
    if (chkRight) chkRight.checked = false;

    sidebar.classList.toggle('bdh-open', shouldOpen);
    if (overlay) overlay.classList.toggle('active', shouldOpen);
    if (chkLeft) chkLeft.checked = shouldOpen;
};

window.toggleOpcionesPerfil = function (event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    const options = document.querySelector('.bdh-right-options');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('bdh-drawer-overlay');
    const chkLeft = document.getElementById('BLACK🦇HOLE');
    const chkRight = document.getElementById('BDH-CONFIG');
    if (!options) return;

    const shouldOpen = !options.classList.contains('bdh-open');
    if (sidebar) sidebar.classList.remove('bdh-open');
    if (chkLeft) chkLeft.checked = false;

    options.classList.toggle('bdh-open', shouldOpen);
    if (overlay) overlay.classList.toggle('active', shouldOpen);
    if (chkRight) chkRight.checked = shouldOpen;
};

// Cerrar con tecla Escape o clic fuera
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        window.cerrarCajones();
        window.cerrarModalPerfil();
    }
});

window.seleccionarAvatar = function (url) {
    localStorage.setItem('bdh_vip_avatar', url);
    const navAvatar = document.getElementById('bdh-nav-avatar');
    const modalAvatar = document.getElementById('bdh-modal-avatar-grande');
    const chatAvatar = document.getElementById('gx-bubble-img');
    if (navAvatar) navAvatar.src = url;
    if (modalAvatar) modalAvatar.src = url;
    if (chatAvatar) chatAvatar.src = url;
    const optionsAvatar = document.getElementById('bdh-options-avatar');
    if (optionsAvatar) optionsAvatar.src = url;
    window.toggleGaleriaAvatares();
};

window.cerrarSesionBDH = function () {
    localStorage.removeItem('bdh_vip_exp');
    localStorage.removeItem('bdh_vip_identity');
    localStorage.removeItem('bdhActiveUser');
    window.location.reload();
};
