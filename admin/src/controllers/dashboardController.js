const systemService = require('../services/systemService');

class DashboardController {
    /**
     * Render administrative dashboard
     */
    async index(req, res) {
        try {
            const [sysInfo, gameMetrics] = await Promise.all([
                systemService.getSystemStatus(),
                systemService.getGameMetrics()
            ]);

            res.render('dashboard/index', {
                pageTitle: 'Dashboard General',
                system: sysInfo.system,
                services: sysInfo.services,
                gameMetrics: gameMetrics
            });
        } catch (error) {
            console.error('[DashboardController] Error loading dashboard:', error);
            res.status(500).render('error', {
                statusCode: 500,
                title: 'Error de Carga',
                message: 'No se pudieron cargar los datos del dashboard.'
            });
        }
    }

    /**
     * API endpoint to get real-time metrics
     */
    async apiStats(req, res) {
        try {
            const [sysInfo, gameMetrics] = await Promise.all([
                systemService.getSystemStatus(),
                systemService.getGameMetrics()
            ]);

            res.json({
                success: true,
                system: sysInfo.system,
                services: sysInfo.services,
                gameMetrics: gameMetrics
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new DashboardController();
