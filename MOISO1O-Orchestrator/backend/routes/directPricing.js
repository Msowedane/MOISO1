const express = require('express');
const { authenticateAdmin } = require('../middleware/adminAuth');
const { directRates, directFees } = require('../controllers/directPricingController');
const approvalQueue = require('../controllers/approvalQueueController');
const systemExchangeRates = require('../controllers/systemExchangeRateController');

const router = express.Router();

router.use(authenticateAdmin);

router.get('/directRates', directRates.list);
router.post('/directrates', directRates.create);
router.put('/updatedirectrates/:id', directRates.update);
router.delete('/deletedirectrates/:id', directRates.remove);

router.get('/directFees', directFees.list);
router.post('/directfees', directFees.create);
router.put('/updatedirectfees/:id', directFees.update);
router.delete('/deletedirectfees/:id', directFees.remove);

router.get('/approval-queue', approvalQueue.listPending);
router.post('/approval-queue/:type/:id', approvalQueue.decide);

router.get('/system-rates', systemExchangeRates.list);
router.post('/system-rates', systemExchangeRates.create);
router.put('/system-rates/:id', systemExchangeRates.update);
router.delete('/system-rates/:id', systemExchangeRates.remove);

module.exports = router;
