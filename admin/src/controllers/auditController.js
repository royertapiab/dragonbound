const auditService = require('../services/auditService');
const { formatDate } = require('../utils/viewHelpers');

class AuditController {
    /**
     * Audit log list
     */
    async index(req, res) {
        try {
            const { search, action, page = 1 } = req.query;
            const data = await auditService.getAuditLogs({
                search,
                action,
                page,
                limit: 30
            });

            res.render('audit/index', {
                pageTitle: 'Registro de Auditoría',
                logs: data.logs,
                pagination: {
                    total: data.total,
                    page: data.page,
                    limit: data.limit,
                    totalPages: data.totalPages
                },
                filters: { search, action },
                formatDate
            });
        } catch (error) {
            console.error('[AuditController] Error:', error);
            req.flash('error', 'Error al cargar registros de auditoría.');
            res.redirect('/');
        }
    }
}

module.exports = new AuditController();
