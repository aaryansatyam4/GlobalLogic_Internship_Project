import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import db from "./db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET; 

app.use(cors());
app.use(express.json()); // Allows JSON request bodies

// ✅ Sign Up API (Register New User)
app.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if user already exists
        const [existingUser] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        const [result] = await db.promise().query("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, hashedPassword]);

        res.status(201).json({ message: "User registered successfully", userId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Login API (Authenticate User)
app.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const [user] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
        if (user.length === 0) {
            return res.status(401).json({ error: "User not found" });
        }

        // Compare password
        const isValid = await bcrypt.compare(password, user[0].password);
        if (!isValid) {
            return res.status(401).json({ error: "Invalid password" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user[0].id, email: user[0].email }, JWT_SECRET, { expiresIn: "1h" });

        res.json({ token, user: { id: user[0].id, username: user[0].username, email: user[0].email } });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Protected Route (Example)
app.get("/profile", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ message: "Access granted!", userId: decoded.id });
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
});

// ✅ Start the Server
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
