const express = require('express');
const { authenticateAdmin, requireModulePermission } = require('../middleware/adminAuth');
const controller = require('../controllers/complianceOverviewController');

const router = express.Router();
router.use(authenticateAdmin);

router.get('/compliance-overview', requireModulePermission('compliance', 'view'), controller.getOverview);

router.get('/edd-cases', requireModulePermission('compliance', 'view'), controller.listEddCases);
router.post('/edd-cases', requireModulePermission('compliance', 'edit'), controller.createEddCase);
router.patch('/edd-cases/:id', requireModulePermission('compliance', 'edit'), controller.updateEddCase);

router.get('/compliance-training', requireModulePermission('compliance', 'view'), controller.listTraining);
router.post('/compliance-training/courses', requireModulePermission('compliance', 'edit'), controller.createTrainingCourse);
router.post('/compliance-training/assignments', requireModulePermission('compliance', 'edit'), controller.createTrainingAssignment);
router.patch('/compliance-training/assignments/:id', requireModulePermission('compliance', 'edit'), controller.updateTrainingAssignment);

router.get('/compliance-policies', requireModulePermission('compliance', 'view'), controller.listPolicies);
router.post('/compliance-policies', requireModulePermission('compliance', 'edit'), controller.createPolicy);
router.patch('/compliance-policies/:id/status', requireModulePermission('compliance', 'edit'), controller.updatePolicyStatus);
router.post('/compliance-policies/:id/acknowledge', requireModulePermission('compliance', 'view'), controller.acknowledgePolicy);

module.exports = router;
