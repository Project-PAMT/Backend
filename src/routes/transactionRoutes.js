const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const auth = require("../middlewares/authMiddleware");

// CREATE
router.post("/", auth, transactionController.createTransaction);

// GET ALL (BY USER)
router.get("/", auth, transactionController.getAllTransactions);

// GET BY ID
router.get("/:id", auth, transactionController.getTransactionById);

// UPDATE
router.put("/:id", auth, transactionController.updateTransaction);

// DELETE
router.delete("/:id", auth, transactionController.deleteTransaction);

module.exports = router;
