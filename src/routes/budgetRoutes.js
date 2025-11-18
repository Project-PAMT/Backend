const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middlewares/authMiddleware");

// CREATE BUDGET
router.post("/", auth, (req, res) => {
    const { category_id, amount, month, year } = req.body;
    const user_id = req.user.id;

    if (!category_id || !amount || !month || !year) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const sql = `
        INSERT INTO budgets (user_id, category_id, amount, month, year)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [user_id, category_id, amount, month, year], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err });
        }
        res.status(201).json({
            message: "Budget created successfully",
            data: { id: result.insertId, user_id, category_id, amount, month, year }
        });
    });
});

// GET ALL BUDGETS BY USER
router.get("/", auth, (req, res) => {
    const user_id = req.user.id;

    const sql = `
        SELECT b.*, c.name AS category_name
        FROM budgets b
        JOIN categories c ON b.category_id = c.id
        WHERE b.user_id = ?
        ORDER BY year DESC, month DESC
    `;

    db.query(sql, [user_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Budgets fetched successfully", data: rows });
    });
});

// UPDATE BUDGET
router.put("/:id", auth, (req, res) => {
    const { amount, category_id, month, year } = req.body;
    const { id } = req.params;

    const sql = `
        UPDATE budgets
        SET amount = ?, category_id = ?, month = ?, year = ?
        WHERE id = ?
    `;

    db.query(sql, [amount, category_id, month, year, id], (err, result) => {
        if (err) return res.status(500).json({ error: err });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Budget not found" });
        }

        res.json({ message: "Budget updated successfully" });
    });
});

// DELETE BUDGET
router.delete("/:id", auth, (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM budgets WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Budget not found" });
        }

        res.json({ message: "Budget deleted successfully" });
    });
});

module.exports = router;
