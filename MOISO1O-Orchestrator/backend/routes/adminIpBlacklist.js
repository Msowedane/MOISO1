
const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/adminIpBlacklistController');
const { authenticateAdmin, requireModulePermission } = require('../middleware/adminAuth');

router.use(authenticateAdmin);
router.get('/', requireModulePermission('configurations', 'view'), ctrl.list);

router.post('/', requireModulePermission('configurations', 'edit'), ctrl.add);

router.delete('/:id', requireModulePermission('configurations', 'edit'), ctrl.remove);

module.exports = router;
