import "./App.css";
import { BrowserRouter as Router, Route, Routes, BrowserRouter } from "react-router-dom";
import Login from "./components/auth/Login.jsx";
import Register from "./components/auth/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Rooms from "./pages/Rooms.jsx";
import Townhouses from "./pages/Townhouses.jsx";
import Staffhouses from "./pages/Staffhouses.jsx";
import Apartments from "./pages/Apartments.jsx";
import BoardingHouses from "./pages/BoardingHouses.jsx";
import Inventory from "./pages/Inventory.jsx";
import RoomsFormPage from "./pages/RoomsFormPage.jsx";
import StaffhousesFormPage from "./pages/StaffhousesFormPage.jsx";
import TownhousesFormPage from "./pages/TownhousesFormPage.jsx";
import ApartmentsFormPage from "./pages/ApartmentsFormPage.jsx";
import BoardingHousesFormPage from "./pages/BoardingHousesFormPage.jsx";
import PMCalendar from "./pages/PMCalendar.jsx";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Main Dashboard Route */}
          <Route path="/" element={<Dashboard />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Page Routes */}
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/townhouses" element={<Townhouses />} />
          <Route path="/staffhouses" element={<Staffhouses />} />
          <Route path="/apartments" element={<Apartments />} />
          <Route path="/boardinghouses" element={<BoardingHouses />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/pmcalendar" element={<PMCalendar />} />

          {/* Form Routes - Add Properties */}
          <Route path="/add-room" element={<RoomsFormPage />} />
          <Route path="/add-townhouse" element={<TownhousesFormPage />} />
          <Route path="/add-staffhouse" element={<StaffhousesFormPage />} />
          <Route path="/add-apartment" element={<ApartmentsFormPage />} />
          <Route path="/add-boardinghouse" element={<BoardingHousesFormPage />} />

          {/* Form Routes - Edit Properties */}
          <Route path="/edit-room/:id" element={<RoomsFormPage />} />
          <Route path="/edit-townhouse/:id" element={<TownhousesFormPage />} />
          <Route path="/edit-staffhouse/:id" element={<StaffhousesFormPage />} />
          <Route path="/edit-apartment/:id" element={<ApartmentsFormPage />} />
          <Route path="/edit-boardinghouse/:id" element={<BoardingHousesFormPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
