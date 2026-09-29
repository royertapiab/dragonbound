// DragonBound Admin Client Script
document.addEventListener('DOMContentLoaded', () => {
    // Live Server Clock
    const clockElement = document.getElementById('live-clock');
    if (clockElement) {
        setInterval(() => {
            const now = new Date();
            clockElement.textContent = now.toLocaleTimeString() + ' (UTC)';
        }, 1000);
    }

    // Auto-refresh stats polling (every 30s)
    if (document.querySelector('.stats-grid')) {
        setInterval(async () => {
            try {
                const res = await fetch('/api/stats', {
                    headers: { 'Accept': 'application/json' }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.gameMetrics) {
                        const elOnline = document.getElementById('stat-online');
                        if (elOnline) elOnline.textContent = data.gameMetrics.onlineAccounts;

                        const elTotal = document.getElementById('stat-accounts');
                        if (elTotal) elTotal.textContent = data.gameMetrics.totalAccounts;
                    }
                }
            } catch (err) {
                // Ignore transient network errors
            }
        }, 30000);
    }
});
