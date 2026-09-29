const logsService = require('../services/logsService');

class LogsController {
    /**
     * System log viewer
     */
    async index(req, res) {
        try {
            const { type = 'game', lines = 100 } = req.query;
            const logData = await logsService.getTail(type, lines);
            const availableLogs = logsService.getAvailableLogs();

            res.render('logs/index', {
                pageTitle: 'Logs del Sistema',
                logData,
                availableLogs,
                currentType: type,
                currentLines: lines
            });
        } catch (error) {
            console.error('[LogsController] Error:', error);
            req.flash('error', 'Error al cargar logs del sistema.');
            res.redirect('/');
        }
    }

    /**
     * API tail endpoint for AJAX refresh
     */
    async apiTail(req, res) {
        try {
            const { type = 'game', lines = 100 } = req.query;
            const logData = await logsService.getTail(type, lines);
            res.json({ success: true, logData });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new LogsController();
