const db = require("../config/db");

// ===========================
// CREATE TRANSACTION
// ===========================
exports.createTransaction = (req, res) => {
    const { category_id, title, amount, type, date, description } = req.body;
    const userId = req.user.id;

    // Validation
    if (!title || !amount || !type || !date) {
        return res.status(400).json({ message: "Title, amount, type, and date are required" });
    }

    const sql = `
        INSERT INTO transactions (user_id, category_id, title, amount, type, date, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [userId, category_id || null, title, amount, type, date, description || null],
        (err, result) => {
            if (err) {
                console.error("SQL Error (CREATE):", err);
                return res.status(500).json({ message: "Database error" });
            }

            res.status(201).json({
                message: "Transaction created successfully",
                data: {
                    id: result.insertId,
                    user_id: userId,
                    category_id: category_id || null,
                    title,
                    amount,
                    type,
                    date,
                    description: description || null
                }
            });
        }
    );
};



// ===========================
// GET ALL TRANSACTIONS FOR USER
// ===========================
exports.getAllTransactions = (req, res) => {
    const userId = req.user.id;

    // ✅ Format tanggal ke YYYY-MM-DD agar konsisten
    const sql = `
        SELECT 
            t.id,
            t.user_id,
            t.category_id,
            t.title,
            t.amount,
            t.type,
            DATE_FORMAT(t.date, '%Y-%m-%d') AS date,
            t.description,
            t.created_at,
            c.name AS category_name
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = ?
        ORDER BY t.date DESC, t.id DESC
    `;

    db.query(sql, [userId], (err, rows) => {
        if (err) {
            console.error("SQL Error (GET ALL):", err);
            return res.status(500).json({ message: "Database error" });
        }

        // ✅ Debug: log jumlah dan sample data
        console.log(`📊 Found ${rows.length} transactions for user ${userId}`);
        if (rows.length > 0) {
            console.log("Sample transaction:", rows[0]);
        }

        res.json({
            message: "Transactions fetched successfully",
            data: rows
        });
    });
};



// ===========================
// GET TRANSACTION BY ID
// ===========================
exports.getTransactionById = (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const sql = `
        SELECT 
            t.*,
            DATE_FORMAT(t.date, '%Y-%m-%d') AS date,
            c.name AS category_name
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.id = ? AND t.user_id = ?
        LIMIT 1
    `;

    db.query(sql, [id, userId], (err, rows) => {
        if (err) {
            console.error("SQL Error (GET BY ID):", err);
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
// UPDATE TRANSACTION
// ===========================
exports.updateTransaction = (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const { category_id, title, amount, type, date, description } = req.body;

    if (!title || !amount || !type || !date) {
        return res.status(400).json({ message: "Title, amount, type, and date are required" });
    }

    const sql = `
        UPDATE transactions
        SET category_id = ?, title = ?, amount = ?, type = ?, date = ?, description = ?
        WHERE id = ? AND user_id = ?
    `;

    db.query(
        sql,
        [category_id || null, title, amount, type, date, description || null, id, userId],
        (err, result) => {
            if (err) {
                console.error("SQL Error (UPDATE):", err);
                return res.status(500).json({ message: "Database error" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Transaction not found" });
            }

            res.json({ message: "Transaction updated successfully" });
        }
    );
};



// ===========================
// DELETE TRANSACTION
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
            console.error("SQL Error (DELETE):", err);
            return res.status(500).json({ message: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.json({ message: "Transaction deleted successfully" });
    });
};