/**
 * Toast notification system for Anki card feedback
 * Shows non-blocking notifications in the top-right corner of the page
 */

const ODH_TOAST_CONTAINER_ID = 'odh-toast-container';
const ODH_TOAST_DURATION = 3500;

function _getToastContainer() {
    let container = document.getElementById(ODH_TOAST_CONTAINER_ID);
    if (!container) {
        container = document.createElement('div');
        container.id = ODH_TOAST_CONTAINER_ID;
        container.style.cssText = [
            'position: fixed',
            'top: 16px',
            'right: 16px',
            'z-index: 2147483647',
            'display: flex',
            'flex-direction: column',
            'gap: 8px',
            'pointer-events: none',
            'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        ].join(';');
        document.body.appendChild(container);
    }
    return container;
}

function _getToastColors(type) {
    switch (type) {
        case 'success': return { bg: '#2e7d32', text: '#fff' };
        case 'error':   return { bg: '#c62828', text: '#fff' };
        case 'warning': return { bg: '#f9a825', text: '#212529' };
        case 'info':
        default:        return { bg: '#1565c0', text: '#fff' };
    }
}

/**
 * Show a toast notification
 * @param {string} message - Text to display
 * @param {'success'|'error'|'warning'|'info'} type - Toast type
 * @param {number} duration - ms before auto-dismiss
 */
function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || ODH_TOAST_DURATION;

    const container = _getToastContainer();
    const colors = _getToastColors(type);
    const toast = document.createElement('div');

    toast.style.cssText = [
        'background-color: ' + colors.bg,
        'color: ' + colors.text,
        'padding: 10px 16px',
        'border-radius: 6px',
        'box-shadow: 0 4px 12px rgba(0,0,0,0.2)',
        'font-size: 13px',
        'line-height: 1.5',
        'max-width: 340px',
        'word-wrap: break-word',
        'pointer-events: auto',
        'opacity: 0',
        'transform: translateX(100%)',
        'transition: opacity 0.3s ease, transform 0.3s ease',
    ].join(';');
    toast.textContent = message;

    container.appendChild(toast);

    // Trigger entrance animation
    requestAnimationFrame(function () {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    });

    // Auto-dismiss
    setTimeout(function () {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(function () {
            toast.remove();
            if (container.children.length === 0) {
                container.remove();
            }
        }, 300);
    }, duration);
}
