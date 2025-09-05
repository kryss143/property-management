import { useEffect, useState } from "react";
import { initFlowbite } from "flowbite";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";

const localizer = momentLocalizer(moment);

const initialEvents = [
  {
    id: 1,
    title: "Board meeting",
    start: new Date(moment().add(1, "days").set({ hour: 10, minute: 0 })),
    end: new Date(moment().add(1, "days").set({ hour: 11, minute: 0 })),
  },
  {
    id: 2,
    title: "Board Exam",
    start: new Date(moment().add(1, "days").set({ hour: 10, minute: 0 })),
    end: new Date(moment().add(1, "days").set({ hour: 11, minute: 0 })),
  },
];

const myEventsList = [...initialEvents];

const PMCalendarStats = () => {
  useEffect(() => {
    initFlowbite();
  }, []);

  const [events, setEvents] = useState(myEventsList);

  return (
    <>
      <div class="p-4 sm:ml-64">
        <div class="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
          <div class="flex items-center justify-center h-200 rounded-sm bg-gray-50 dark:bg-gray-800">
            <div
              style={{
                marginLeft: "0px",
                marginRight: "0px",
                marginTop: "0px",
                marginBottom: "0px",
                width: "100%",
                height: "100%",
              }}
            >
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%", width: "100%", fontSize: "20px" }}
                className={"dark:text-white text-black"}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PMCalendarStats;
