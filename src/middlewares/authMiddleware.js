const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    // Support: "Bearer xxxxx" atau "xxxxx"
    const token = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

    if (!token) {
        return res.status(401).json({ message: "Invalid token format" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Pastikan decoded mengandung id dan email
        if (!decoded.id) {
            return res.status(400).json({ message: "Token missing user ID" });
        }

        req.user = decoded; // -> { id, email }
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};
