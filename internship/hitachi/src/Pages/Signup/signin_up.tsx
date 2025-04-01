import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import "./signin_up.css";
import { TextInput } from "../../Components/TextInput"; // ✅ Fixed
import { Button } from "../../Components/Button";      // ✅ Fixed

const SignInUp = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });
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
            username: "",  
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

    return (
        <div className="container">
            <div className="form-container">
                <h2>{isSignUp ? "Sign Up" : "Sign In"}</h2>
                {message && <p className="error-message">{message}</p>}
                <form onSubmit={handleSubmit}>
                    <TextInput
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <TextInput
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <Button type="submit" text={isSignUp ? "Sign Up" : "Sign In"} />
                </form>
                <p className="toggle-text">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"} 
                    <Button text={isSignUp ? "Sign In" : "Sign Up"} onClick={() => setIsSignUp(!isSignUp)} className="toggle-button" />
                </p>
            </div>
        </div>
    );
};

export default SignInUp;
