import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import Button from "../../Components/Button";
import TextInput from "../../Components/TextInput";

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchBlog();
    fetchComments();
  }, []);

  const fetchBlog = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/getBlog/${id}`);
      setBlog(response.data);
    } catch (error) {
      console.error("Error fetching blog post:", error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/getComments/${id}`);
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleCommentSubmit = async () => {
    const token = Cookies.get("authToken");
    if (!token) return alert("Unauthorized. Please login.");

    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT token
      const userId = decodedToken.id;

      await axios.post("http://localhost:5001/addComment", {
        post_id: id,
        user_id: userId,
        content: comment,
      });

      setComment(""); // Clear input field
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Button text="Back to Dashboard" onClick={() => navigate("/dashboard")} className="bg-gray-500 text-white px-4 py-2 rounded mb-4" />

      {blog ? (
        <div className="border p-6 rounded shadow">
          <h1 className="text-2xl font-bold">{blog.title}</h1>
          <p className="text-gray-600">By {blog.username} in {blog.category}</p>
          <p className="mt-4">{blog.content}</p>
          <p className="text-sm text-gray-400 mt-2">Posted on {new Date(blog.created_at).toLocaleString()}</p>
        </div>
      ) : (
        <p>Loading blog...</p>
      )}

      {/* Write a Comment */}
      <div className="mt-6 border p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">Write a Comment</h2>
        <TextInput
          type="text"
          placeholder="Write your comment here..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />
        <Button text="Post Comment" onClick={handleCommentSubmit} className="bg-blue-500 text-white px-4 py-2 rounded mt-2" />
      </div>

      {/* View Comments */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Comments</h2>
        {comments.length === 0 ? (
          <p>No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="border-b py-2">
              <p className="text-gray-800 font-semibold">{c.username}</p>
              <p className="text-gray-600">{c.content}</p>
              <p className="text-sm text-gray-400">{new Date(c.created_at).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BlogDetail;
