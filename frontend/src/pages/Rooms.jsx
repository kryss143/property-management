import { useEffect } from "react";
import { initFlowbite } from "flowbite";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import DataStats from "../components/layout/DataStats";

const Rooms = () => {
    
  useEffect(() => {
    initFlowbite();
  }, []);

  return (
    <>
      <Navbar />
      <Sidebar />
      <DataStats />
    </>
  );
};

export default Rooms;
