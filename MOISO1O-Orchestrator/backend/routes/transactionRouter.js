const express = require("express");
const {
    createTransactionController,
    getAllTransactionsController,
    getTransactionByIdController,
    updateTransactionController,
    deleteTransactionController,
} = require("../controllers/transactionController");

const router = express.Router();
router.post("/", createTransactionController);
router.patch("/:id", updateTransactionController);
router.delete("/:id", deleteTransactionController);
router.put("/:id", updateTransactionController);
router.get("/", getAllTransactionsController);
router.get("/:id", getTransactionByIdController);
module.exports = router;