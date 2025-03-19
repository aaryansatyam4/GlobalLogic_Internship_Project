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

        // Generate JWT token with username
        const token = jwt.sign(
            { id: user[0].id, username: user[0].username, email: user[0].email }, 
            JWT_SECRET, 
            { expiresIn: "1h" }
        );

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

// ✅ Add a New Category
app.post("/addCategory", async (req, res) => {
    const { name } = req.body;

    try {
        const [result] = await db.promise().query("INSERT INTO categories (name) VALUES (?)", [name]);
        res.status(201).json({ categoryId: result.insertId, message: "Category added successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Add a New Post
app.post("/addPost", async (req, res) => {
    const { user_id, title, content, category_id } = req.body;

    try {
        await db.promise().query(
            "INSERT INTO posts (user_id, title, content, category_id) VALUES (?, ?, ?, ?)", 
            [user_id, title, content, category_id]
        );
        res.status(201).json({ message: "Post added successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});


app.post("/addBlog", async (req, res) => {
    const { user_id, title, content, category_id } = req.body;

    try {
        const [result] = await db.promise().query(
            "INSERT INTO posts (user_id, title, content, category_id) VALUES (?, ?, ?, ?)",
            [user_id, title, content, category_id]
        );

        res.status(201).json({ message: "Blog post added successfully", postId: result.insertId });
    } catch (error) {
        console.error("Error adding blog post:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/getBlogs", async (req, res) => {
    try {
        const [posts] = await db.promise().query(`
            SELECT posts.id, posts.title, posts.content, posts.created_at, 
                   users.username, categories.name AS category 
            FROM posts 
            JOIN users ON posts.user_id = users.id 
            LEFT JOIN categories ON posts.category_id = categories.id
            ORDER BY posts.created_at DESC
        `);

        res.json(posts);
    } catch (error) {
        console.error("Error fetching blog posts:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/getCategories", async (req, res) => {
    try {
        const [categories] = await db.promise().query("SELECT * FROM categories");
        res.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Server error" });
    }
});
app.get("/getBlog/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const [post] = await db.promise().query(`
            SELECT posts.id, posts.title, posts.content, posts.created_at, 
                   users.username, categories.name AS category 
            FROM posts 
            JOIN users ON posts.user_id = users.id 
            LEFT JOIN categories ON posts.category_id = categories.id
            WHERE posts.id = ?
        `, [id]);

        if (post.length === 0) {
            return res.status(404).json({ error: "Blog post not found" });
        }

        res.json(post[0]);
    } catch (error) {
        console.error("Error fetching blog post:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Add a New Comment
app.post("/addComment", async (req, res) => {
    const { post_id, user_id, content } = req.body;

    if (!post_id || !user_id || !content) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const [result] = await db.promise().query(
            "INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)", 
            [post_id, user_id, content]
        );

        res.status(201).json({ message: "Comment added successfully", commentId: result.insertId });
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Get Comments for a Post
app.get("/getComments/:post_id", async (req, res) => {
    const { post_id } = req.params;

    try {
        const [comments] = await db.promise().query(`
            SELECT comments.id, comments.content, comments.created_at, 
                   users.username 
            FROM comments 
            JOIN users ON comments.user_id = users.id 
            WHERE comments.post_id = ?
            ORDER BY comments.created_at ASC
        `, [post_id]);

        res.json(comments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ error: "Server error" });
    }
});






// ✅ Start the Server
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
