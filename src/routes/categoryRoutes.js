const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middlewares/authMiddleware");

// ===========================
// CREATE CATEGORY
// ===========================
router.post("/", auth, (req, res) => {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name) {
        return res.status(400).json({ message: "Name is required" });
    }

    const sql = "INSERT INTO categories (name, user_id) VALUES (?, ?)";

    db.query(sql, [name, userId], (err, result) => {
        if (err) {
            console.error("SQL Error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        res.status(201).json({
            message: "Category created successfully",
            category: { id: result.insertId, name, user_id: userId }
        });
    });
});

// ===========================
// GET ALL CATEGORIES (BY USER)
// ===========================
router.get("/", auth, (req, res) => {
    const userId = req.user.id;

    const sql = "SELECT * FROM categories WHERE user_id = ? ORDER BY id DESC";

    db.query(sql, [userId], (err, rows) => {
        if (err) {
            console.error("SQL Error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        res.json({
            message: "Categories fetched successfully",
            data: rows
        });
    });
});

// ===========================
// UPDATE CATEGORY
// ===========================
router.put("/:id", auth, (req, res) => {
    const { name } = req.body;
    const { id } = req.params;
    const userId = req.user.id;

    if (!name) {
        return res.status(400).json({ message: "Name is required" });
    }

    const sql = "UPDATE categories SET name = ? WHERE id = ? AND user_id = ?";

    db.query(sql, [name, id, userId], (err, result) => {
        if (err) {
            console.error("SQL Error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Category not found or not owned by user" });
        }

        res.json({ message: "Category updated successfully" });
    });
});

// ===========================
// DELETE CATEGORY
// ===========================
router.delete("/:id", auth, (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const sql = "DELETE FROM categories WHERE id = ? AND user_id = ?";

    db.query(sql, [id, userId], (err, result) => {
        if (err) {
            console.error("SQL Error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Category not found or not owned by user" });
        }

        res.json({ message: "Category deleted successfully" });
    });
});

module.exports = router;
