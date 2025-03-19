import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignInUp from "./Pages/Signup/signin_up";
import Dashboard from "./Pages//Dashboard/Dashboard";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<SignInUp />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </Router>
    );
}

export default App;
