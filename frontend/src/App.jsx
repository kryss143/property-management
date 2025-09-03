import "./App.css";
import Sidebar from "./components/layout/Sidebar.jsx";
import { BrowserRouter as Router, Route, Routes, BrowserRouter } from "react-router-dom";
import Login from "./components/auth/Login.jsx";
import Register from "./components/auth/Register.jsx";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Sidebar />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
