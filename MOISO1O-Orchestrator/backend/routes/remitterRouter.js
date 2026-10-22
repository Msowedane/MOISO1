const express = require("express");
const remitterController = require("../controllers/remitterController");
const { authenticateAdmin } = require("../middleware/adminAuth");
const router = express.Router();

router.use(authenticateAdmin);
// CREATE REMITTER
router.post("/", remitterController.createRemitter);

// GET ALL REMITTERS
router.get("/", remitterController.getAllRemitters);

// GET REMITTER BY ID
router.get("/:remitterId", remitterController.getRemitter);

// UPDATE REMITTER
router.put("/:remitterId", remitterController.updateRemitter);
router.patch("/:remitterId", remitterController.updateRemitter);

// DELETE REMITTER
router.delete("/:remitterId", remitterController.deleteRemitter);

module.exports = router;
