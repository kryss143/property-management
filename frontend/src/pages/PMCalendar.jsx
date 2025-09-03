import { useEffect } from "react";
import { initFlowbite } from "flowbite";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import PMCalendarStats from "../components/layout/PMCalendarStats";

const PMCalendar = () => {
  useEffect(() => {
    initFlowbite();
  }, []);

  return (
    <>
      <Navbar />
      <Sidebar />
      <PMCalendarStats />
    </>
  );
};

export default PMCalendar;
