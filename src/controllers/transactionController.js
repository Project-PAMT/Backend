const db = require("../config/db");

// ===========================
// CREATE TRANSACTION
// ===========================
exports.createTransaction = (req, res) => {
    const { category_id, title, amount, type } = req.body;
    const userId = req.user.id;

    if (!title || !amount || !type) {
        return res.status(400).json({ message: "Title, amount, and type are required" });
    }

    const sql = `
      INSERT INTO transactions (user_id, category_id, title, amount, type)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [userId, category_id || null, title, amount, type], (err, result) => {
        if (err) {
            console.error("SQL Error:", err);
            return res.status(500).json({ message: "Database error" });
        }

        res.status(201).json({
            message: "Transaction created successfully",
            data: {
                id: result.insertId,
                user_id: userId,
                category_id,
                title,
                amount,
                type
            }
        });
    });
};

// ===========================
// GET ALL (BY USER)
// ===========================
exports.getAllTransactions = (req, res) => {
    const userId = req.user.id;

    const sql = `
      SELECT t.*, c.name AS category_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
      ORDER BY t.id DESC
    `;

    db.query(sql, [userId], (err, rows) => {
        if (err) {
            console.error("SQL Error:", err);
            return res.status(500).json({ message: "Database error" });
        }

        res.json({
            message: "Transactions fetched successfully",
            data: rows
        });
    });
};

// ===========================
// GET BY ID
// ===========================
exports.getTransactionById = (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const sql = `
      SELECT * FROM transactions
      WHERE id = ? AND user_id = ?
    `;

    db.query(sql, [id, userId], (err, rows) => {
        if (err) {
            console.error("SQL Error:", err);
            return res.status(500).json({ message: "Database error" });
        }

        if (rows.length === 0) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.json({
            message: "Transaction fetched successfully",
            data: rows[0]
        });
    });
};

// ===========================
// UPDATE
// ===========================
exports.updateTransaction = (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const { category_id, title, amount, type } = req.body;

    const sql = `
      UPDATE transactions
      SET category_id = ?, title = ?, amount = ?, type = ?
      WHERE id = ? AND user_id = ?
    `;

    db.query(sql, [category_id || null, title, amount, type, id, userId], (err, result) => {
        if (err) {
            console.error("SQL Error:", err);
            return res.status(500).json({ message: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.json({ message: "Transaction updated successfully" });
    });
};

// ===========================
// DELETE
// ===========================
exports.deleteTransaction = (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const sql = `
      DELETE FROM transactions
      WHERE id = ? AND user_id = ?
    `;

    db.query(sql, [id, userId], (err, result) => {
        if (err) {
            console.error("SQL Error:", err);
            return res.status(500).json({ message: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.json({ message: "Transaction deleted successfully" });
    });
};
