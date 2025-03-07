import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import "./signin_up.css";

const SignInUp = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [message, setMessage] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const navigate = useNavigate();
    useEffect(() => {
        const token = Cookies.get("authToken");
        if (token) {
            setIsLoggedIn(true);
            navigate("/dashboard"); 
        }
    }, [navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
    
        const requestData = {
            username: "",  // Add a default empty username
            email: formData.email,
            password: formData.password
        };
    
        const url = isSignUp ? "http://localhost:5001/signup" : "http://localhost:5001/signin";
        try {
            const response = await axios.post(url, requestData);
            if (isSignUp) {
                setMessage("User registered successfully! You can now sign in.");
            } else {
                Cookies.set("authToken", response.data.token, { expires: 1, secure: true, sameSite: "Strict" });
                setIsLoggedIn(true);
                navigate("/dashboard"); 
            }
        } catch (error) {
            setMessage(error.response?.data.error || "Something went wrong");
        }
    };
    

    const handleLogout = () => {
        Cookies.remove("authToken");
        setIsLoggedIn(false);
    };

    return (
        <div className="container">
            <div className="form-container">
                <h2>{isSignUp ? "Sign Up" : "Sign In"}</h2>
                {message && <p className="error-message">{message}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input-field"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="input-field"
                        required
                    />
                    <button type="submit" className={isSignUp ? "signup-button" : "signin-button"}>
                        {isSignUp ? "Sign Up" : "Sign In"}
                    </button>
                </form>
                <p className="toggle-text">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"} 
                    <button onClick={() => setIsSignUp(!isSignUp)} className="toggle-button">
                        {isSignUp ? "Sign In" : "Sign Up"}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default SignInUp;
