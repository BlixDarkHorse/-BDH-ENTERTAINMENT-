/**
 * =========================================================================
 * WARM HOLE - KEPPLER TELEPORTATION ENGINE
 * UNIVERSO BDH - BLAZAR ON READY
 * =========================================================================
 */
window.WarmHole = {
    teleportToPlayer: function(src, title, series) {
        const activeUser = localStorage.getItem('bdhActiveUser');
        const expTime = parseInt(localStorage.getItem('bdh_vip_exp')) || 0;
        if (!activeUser || expTime <= Date.now()) {
            alert('🔒 ACCESO RESTRINGIDO: Debes autenticarte en Galaxy Vyoleta antes de ingresar a Black Tube.');
            if (typeof window.toggleGxChat === 'function') {
                window.toggleGxChat(true);
            }
            return;
        }

        let target = 'OJO DE KILLROG/KILLROG.html';
        const params = [];
        if (src) params.push('src=' + encodeURIComponent(src));
        if (title) params.push('title=' + encodeURIComponent(title));
        if (series) params.push('series=' + encodeURIComponent(series));
        if (params.length > 0) {
            target += '?' + params.join('&');
        }
        window.location.href = target;
    },

    returnToPortal: function() {
        window.location.href = '../index.html';
    }
};

// Atajo de teclado: 'B' o 'K' abre el reproductor Black Tube
document.addEventListener('keydown', (e) => {
    if (['input', 'textarea'].includes(document.activeElement?.tagName?.toLowerCase())) return;
    if (e.code === 'KeyK' || e.code === 'KeyB') {
        window.WarmHole.teleportToPlayer();
    }
});
