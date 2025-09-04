import { useEffect } from "react";
import { initFlowbite } from "flowbite";

const PMCalendarStats = () => {
  useEffect(() => {
    initFlowbite();
  }, []);

  return (
    <>
      <div class="p-4 sm:ml-64">
        <div class="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
          <div class="flex items-center justify-center h-185 rounded-sm bg-gray-50 dark:bg-gray-800">

          </div>
        </div>
      </div>
    </>
  );
};

export default PMCalendarStats;
