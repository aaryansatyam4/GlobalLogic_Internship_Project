import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignInUp from "./Pages/Signup/signin_up";
import Dashboard from "./Pages//Dashboard/Dashboard";
import BlogDetail from "./Pages/BlogDetail/BlogDetail";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<SignInUp />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/blog/:id" element={<BlogDetail />} />

            </Routes>
        </Router>
    );
}

export default App;
