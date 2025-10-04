console.log('Initializing global toast module...');

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
                console.log('Toast system (Ant Design message) configured successfully.');
            }
        }).catch(err => {
            console.error('Failed to import antd:', err);
        });
    } catch (e) {
        console.error('Failed to initialize Toast:', e);
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