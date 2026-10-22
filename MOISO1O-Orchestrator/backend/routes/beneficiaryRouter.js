const express = require('express')
const { authenticateAdmin } = require('../middleware/adminAuth')
const beneficiaryController = require('../controllers/beneficiaryController')
const router = express.Router();


router.use(authenticateAdmin)

router.post('/createbeneficairy', beneficiaryController.createBeneficiaryController)
router.get('/', beneficiaryController.getAllBeneficiaryController)
router.get("/:id", beneficiaryController.getBeneficiaryController)
router.put('/:id', beneficiaryController.updateBeneficiaryController)
router.delete('/:id', beneficiaryController.deleteBeneficiaryController)

module.exports = router
