import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import Button from "../../Components/Button";
import Modal from "../../Components/Modal";
import TextInput from "../../Components/TextInput";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category_id: "",
  });

  useEffect(() => {
    const token = Cookies.get("authToken");
    if (!token) {
      navigate("/");
    }
    fetchCategories();
    fetchPosts();
  }, [navigate]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:5001/getCategories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get("http://localhost:5001/getBlogs");
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts", error);
    }
  };

  const handleLogout = () => {
    Cookies.remove("authToken");
    navigate("/");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    const token = Cookies.get("authToken");
    if (!token) return alert("Unauthorized. Please login.");

    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT token
      const userId = decodedToken.id;

      await axios.post("http://localhost:5001/addBlog", {
        user_id: userId,
        title: formData.title,
        content: formData.content,
        category_id: formData.category_id,
      });

      alert("Post created successfully!");
      setIsModalOpen(false);
      setFormData({ title: "", content: "", category_id: "" });
      fetchPosts();
    } catch (error) {
      console.error("Error saving post", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button text="Logout" onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded" />
      </div>

      <Button text="Create Post" onClick={() => setIsModalOpen(true)} className="bg-green-500 text-white px-4 py-2 rounded" />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-xl font-semibold mb-4">Create Post</h2>

        <select
          name="category_id"
          value={formData.category_id}
          onChange={handleInputChange}
          className="border p-2 w-full rounded mb-2"
          required
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <TextInput type="text" name="title" placeholder="Post Title" value={formData.title} onChange={handleInputChange} required />
        <textarea name="content" placeholder="Post Content" value={formData.content} onChange={handleInputChange} className="border p-2 w-full rounded mb-2" required />

        <Button text="Submit" onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded mt-4" />
      </Modal>

      {/* Displaying Blog Titles Only */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Blog Posts</h2>
        {posts.length === 0 ? (
          <p>No blog posts found.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="border-b py-2">
              <button
                className="text-blue-500 hover:underline text-lg"
                onClick={() => navigate(`/blog/${post.id}`)}
              >
                {post.title}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
