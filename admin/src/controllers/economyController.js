const economyService = require('../services/economyService');
const auditService = require('../services/auditService');
const { formatNumber, formatDate } = require('../utils/viewHelpers');

class EconomyController {
    /**
     * Economy dashboard & ranking
     */
    async index(req, res) {
        try {
            const overview = await economyService.getOverview();
            res.render('economy/index', {
                pageTitle: 'Gestión Económica',
                overview,
                formatNumber
            });
        } catch (error) {
            console.error('[EconomyController] Error:', error);
            req.flash('error', 'Error al cargar datos económicos.');
            res.redirect('/');
        }
    }

    /**
     * Modify player funds (Gold / Cash / GP)
     */
    async modifyFunds(req, res) {
        try {
            const { userId, type, operation, amount, reason } = req.body;
            const result = await economyService.modifyFunds({
                userId,
                type,
                operation,
                amount
            });

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: `economy.${operation}_${type}`,
                targetType: 'user',
                targetId: result.user.Id,
                targetGameId: result.user.game_id,
                oldValue: { [type]: result.oldVal },
                newValue: { [type]: result.newVal, reason: reason || 'Modificación manual' },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', `Balance de ${result.user.game_id} actualizado. Nuevo balance de ${type.toUpperCase()}: ${formatNumber(result.newVal)}`);
            const redirectUrl = req.headers.referer || '/economy';
            res.redirect(redirectUrl);
        } catch (error) {
            req.flash('error', error.message || 'Error al modificar fondos.');
            res.redirect('/economy');
        }
    }

    /**
     * Mass airdrop
     */
    async massAirdrop(req, res) {
        try {
            const { target, type, amount, reason } = req.body;
            const result = await economyService.massAirdrop({ target, type, amount });

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: `economy.airdrop_${type}`,
                targetType: 'system',
                targetId: null,
                targetGameId: `all_${target}`,
                oldValue: null,
                newValue: { target, type, amount, reason: reason || 'Airdrop global', affected: result.affectedRows },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', `Airdrop ejecutado con éxito. Se entregaron ${formatNumber(amount)} de ${type.toUpperCase()} a ${result.affectedRows} jugadores (${target}).`);
            res.redirect('/economy');
        } catch (error) {
            req.flash('error', error.message || 'Error en el airdrop.');
            res.redirect('/economy');
        }
    }

    /**
     * List PIN Codes
     */
    async pincodes(req, res) {
        try {
            const { page = 1, state } = req.query;
            const data = await economyService.listPinCodes({ page, limit: 20, state });

            res.render('economy/pincodes', {
                pageTitle: 'Códigos PIN / Vouchers',
                pins: data.pins,
                pagination: {
                    total: data.total,
                    page: data.page,
                    limit: data.limit,
                    totalPages: data.totalPages
                },
                filters: { state },
                formatNumber,
                formatDate
            });
        } catch (error) {
            console.error('[EconomyController] Error:', error);
            req.flash('error', 'Error al cargar códigos PIN.');
            res.redirect('/economy');
        }
    }

    /**
     * Create new PIN code
     */
    async createPincode(req, res) {
        try {
            const { pin, rode, seller } = req.body;
            const result = await economyService.createPinCode({
                pin,
                rode,
                seller: seller || req.session.admin.gameId,
                gm: req.session.admin.gameId,
                gm_id: req.session.admin.userId
            });

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: 'economy.create_pincode',
                targetType: 'pincode',
                targetId: result.id,
                targetGameId: result.pin,
                oldValue: null,
                newValue: { pin: result.pin, rode: result.rode },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', `Código PIN generado exitosamente: ${result.pin} (${formatNumber(result.rode)} Cash)`);
            res.redirect('/economy/pincodes');
        } catch (error) {
            req.flash('error', error.message || 'Error al generar código PIN.');
            res.redirect('/economy/pincodes');
        }
    }

    /**
     * Delete PIN code
     */
    async deletePincode(req, res) {
        try {
            await economyService.deletePinCode(req.params.id);

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: 'economy.delete_pincode',
                targetType: 'pincode',
                targetId: req.params.id,
                targetGameId: null,
                oldValue: null,
                newValue: { deletedId: req.params.id },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', 'Código PIN eliminado.');
            res.redirect('/economy/pincodes');
        } catch (error) {
            req.flash('error', error.message || 'Error al eliminar PIN.');
            res.redirect('/economy/pincodes');
        }
    }
}

module.exports = new EconomyController();
