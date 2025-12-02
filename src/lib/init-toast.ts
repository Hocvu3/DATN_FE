
const initToast = () => {
    try {
        // Import antd dynamically
        import('antd').then((antd) => {
            const { message } = antd;
            if (message) {
                message.config({
                    top: 80,
                    duration: 3,
                    maxCount: 3,
                });
            }
        }).catch(err => {
        });
    } catch (e) {
    }
};

if (typeof window !== 'undefined') {
    // Initialize on load
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', initToast);
    } else {
        initToast();
    }

    // Also initialize when script loads
    initToast();
}