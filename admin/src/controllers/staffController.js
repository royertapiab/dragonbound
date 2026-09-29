const staffService = require('../services/staffService');
const auditService = require('../services/auditService');
const { formatDate, getRankInfo } = require('../utils/viewHelpers');

class StaffController {
    /**
     * Staff roster & roles matrix
     */
    async index(req, res) {
        try {
            const [staffData, matrixData] = await Promise.all([
                staffService.listStaff(),
                staffService.getRolesAndPermissions()
            ]);

            res.render('staff/index', {
                pageTitle: 'Staff & Roles Administrativos',
                staff: staffData.staff,
                roles: staffData.roles,
                permissions: matrixData.permissions,
                matrix: matrixData.matrix,
                formatDate,
                getRankInfo
            });
        } catch (error) {
            console.error('[StaffController] Error:', error);
            req.flash('error', 'Error al cargar personal administrativo.');
            res.redirect('/');
        }
    }

    /**
     * Add new staff
     */
    async add(req, res) {
        try {
            const { username, roleId } = req.body;
            const account = await staffService.addStaff({
                username,
                roleId,
                createdBy: req.session.admin.userId
            });

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: 'staff.create',
                targetType: 'staff',
                targetId: account.Id,
                targetGameId: account.Username,
                oldValue: null,
                newValue: { username: account.Username, roleId },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', `Usuario '${account.Username}' añadido al staff administrativo con éxito.`);
            res.redirect('/staff');
        } catch (error) {
            req.flash('error', error.message || 'Error al agregar staff.');
            res.redirect('/staff');
        }
    }

    /**
     * Update staff role
     */
    async updateRole(req, res) {
        try {
            const { roleId } = req.body;
            await staffService.updateStaffRole(req.params.id, roleId);

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: 'staff.edit_role',
                targetType: 'staff',
                targetId: req.params.id,
                targetGameId: null,
                oldValue: null,
                newValue: { newRoleId: roleId },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', 'Rol administrativo actualizado.');
            res.redirect('/staff');
        } catch (error) {
            req.flash('error', error.message || 'Error al cambiar rol.');
            res.redirect('/staff');
        }
    }

    /**
     * Toggle staff status
     */
    async toggleStatus(req, res) {
        try {
            const { is_active } = req.body;
            await staffService.toggleStaffStatus(req.params.id, is_active === '1');

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: 'staff.toggle_status',
                targetType: 'staff',
                targetId: req.params.id,
                targetGameId: null,
                oldValue: null,
                newValue: { is_active },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', is_active === '1' ? 'Acceso administrativo activado.' : 'Acceso administrativo desactivado.');
            res.redirect('/staff');
        } catch (error) {
            req.flash('error', error.message || 'Error al cambiar estado de staff.');
            res.redirect('/staff');
        }
    }

    /**
     * Remove staff
     */
    async delete(req, res) {
        try {
            await staffService.removeStaff(req.params.id);

            await auditService.logAction({
                adminUserId: req.session.admin.userId,
                adminGameId: req.session.admin.gameId,
                action: 'staff.remove',
                targetType: 'staff',
                targetId: req.params.id,
                targetGameId: null,
                oldValue: null,
                newValue: { deletedStaffId: req.params.id },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            req.flash('success', 'Staff eliminado del panel de administración.');
            res.redirect('/staff');
        } catch (error) {
            req.flash('error', error.message || 'Error al eliminar staff.');
            res.redirect('/staff');
        }
    }
}

module.exports = new StaffController();
