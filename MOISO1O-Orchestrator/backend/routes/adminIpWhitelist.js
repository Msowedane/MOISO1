
const express = require('express');
const router = express.Router();
const adminIpWhitelistController = require('../controllers/adminIpWhitelistController');
const { authenticateAdmin, requireModulePermission } = require('../middleware/adminAuth');

router.use(authenticateAdmin);
router.get('/', requireModulePermission('configurations', 'view'), adminIpWhitelistController.list);
router.post('/', requireModulePermission('configurations', 'edit'), adminIpWhitelistController.add);
router.put('/:id', requireModulePermission('configurations', 'edit'), adminIpWhitelistController.update);
router.delete('/:id', requireModulePermission('configurations', 'edit'), adminIpWhitelistController.remove);

module.exports = router;
