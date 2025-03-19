import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Dashboard = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([
    {
      id: 1,
      title: "Understanding React Hooks",
      content: "React Hooks let you use state and other features without writing a class. They simplify code and enhance functionality.",
    },
    {
      id: 2,
      title: "Introduction to TypeScript",
      content: "TypeScript adds static typing to JavaScript, making code more predictable and easier to debug.",
    },
    {
      id: 3,
      title: "GraphQL vs REST APIs",
      content: "GraphQL provides more flexibility than REST by allowing clients to request only the needed data.",
    },
    {
      id: 4,
      title: "Optimizing React Performance",
      content: "Using React.memo, lazy loading, and optimizing re-renders can significantly improve app performance.",
    },
    {
      id: 5,
      title: "Getting Started with Node.js",
      content: "Node.js is a JavaScript runtime built on Chrome's V8 engine, ideal for scalable network applications.",
    },
  ]);
  const [newBlog, setNewBlog] = useState({ title: '', content: '', image: null });

  useEffect(() => {
    const token = Cookies.get('authToken');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    Cookies.remove('authToken');
    navigate('/');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBlog({ ...newBlog, [name]: value });
  };

  const handleImageChange = (e) => {
    setNewBlog({ ...newBlog, image: e.target.files[0] });
  };

  const handleAddBlog = () => {
    if (newBlog.title && newBlog.content) {
      const newEntry = { ...newBlog, id: blogs.length + 1 };
      setBlogs([newEntry, ...blogs]);
      setNewBlog({ title: '', content: '', image: null });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Section</h1>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
      <div className="mb-6 p-4 border rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Create a New Blog</h2>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={newBlog.title}
          onChange={handleInputChange}
          className="border p-2 w-full rounded mb-2"
        />
        <textarea
          name="content"
          placeholder="Content"
          value={newBlog.content}
          onChange={handleInputChange}
          className="border p-2 w-full rounded mb-2"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="border p-2 w-full rounded mb-2"
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleAddBlog}
        >
          Add Blog
        </button>
      </div>
      {blogs.map((blog) => (
        <div key={blog.id} className="mb-6 p-4 border rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">{blog.title}</h2>
          <p className="mb-4">{blog.content}</p>
          {blog.image && (
            <img src={URL.createObjectURL(blog.image)} alt={blog.title} className="w-full h-auto rounded" />
          )}
        </div>
      ))}
    </div>
  );
};

export default Dashboard;