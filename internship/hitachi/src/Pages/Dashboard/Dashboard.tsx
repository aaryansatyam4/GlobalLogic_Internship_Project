import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { Navbar } from "../../Components/Navbar";
import { Button } from "../../Components/Button";
import { Modal } from "../../Components/Modal";
import { TextInput } from "../../Components/TextInput";


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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    const token = Cookies.get("authToken");
    if (!token) return alert("Unauthorized. Please login.");

    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
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
    <div className="min-h-screen bg-gray-50">
      <Navbar onNewPost={() => setIsModalOpen(true)} />

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Post">
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

          <Button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
            Submit
          </Button>
        </Modal>

        <section className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog Posts</h2>
          {posts.length === 0 ? (
            <p className="text-gray-500">No blog posts found.</p>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="bg-white shadow sm:rounded-lg overflow-hidden mb-4">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    <button
                      className="text-blue-500 hover:underline"
                      onClick={() => navigate(`/blog/${post.id}`)}
                    >
                      {post.title}
                    </button>
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Category: {post.category_name}</span>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
