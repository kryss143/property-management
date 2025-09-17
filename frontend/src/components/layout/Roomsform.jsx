import { useEffect } from "react";
import { initFlowbite, Datepicker } from "flowbite";

const Roomsform = () => {
  useEffect(() => {
    initFlowbite();

    const datepickerStartDate = document.getElementById(
      "default-datepicker-startdate"
    );
    if (datepickerStartDate) {
      new Datepicker(datepickerStartDate, {
        format: "mm/dd/yyyy",
        autohide: true,
        clearBtn: true,
        todayBtn: true,
        scrollable: true,
        orientation: "top",
        
      });
    }

    const datepickerEndDate = document.getElementById(
      "default-datepicker-enddate"
    );
    if (datepickerEndDate) {
      new Datepicker(datepickerEndDate, {
        format: "mm/dd/yyyy",
        autohide: true,
        clearBtn: true,
        todayBtn: true,
        scrollable: true,
        orientation: "top",
      });
    }
  }, []);

  return (
    <>
      <div class="p-2 sm:ml-64">
        <div class="p-2 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
          <div class="pl-3 pt-4 pb-4 pr-4 rounded-lg bg-gray-50 dark:bg-gray-800 mb-2">
            <p class="text-2xl font-semibold leading-none text-gray-900 dark:text-white">
              Add Room Form
            </p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
            <form class="p-3">
              <div class="grid gap-5 mb-6 md:grid-cols-2">
                <div>
                  <label
                    for="room-no"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Room No#:
                  </label>
                  <input
                    type="text"
                    id="room-no"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="#R000"
                    required
                  />
                </div>
                <div>
                  <label
                    for="tenant-name"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Tenant:
                  </label>
                  <input
                    type="text"
                    id="tenant-name"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label
                    for="room-rent"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Room rent (per month):
                  </label>
                  <input
                    type="text"
                    id="room-rent"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label
                    for="phone"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Tenant's phone number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="123-45-678"
                    pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
                    required
                  />
                </div>
                <div>
                  <label
                    for="property-status"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Property Status
                  </label>
                  <select
                    id="property-status"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  >
                    <option selected>Choose property status</option>
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="under-maintenance">Under Maintenance</option>
                    <option value="reserved">Reserved</option>
                  </select>
                </div>
                <div>
                  <label
                    for="property-duration"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Property Duration
                  </label>
                  <select
                    id="property-duration"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  >
                    <option selected>Choose property duration</option>
                    <option value="US">Short Term (1-6 months)</option>
                    <option value="CA">Long Term (6+ months)</option>
                  </select>
                </div>
                <div>
                  <label
                    for="property-duration"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Booking Type
                  </label>
                  <select
                    id="property-duration"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  >
                    <option selected>Choose booking type</option>
                    <option value="agoda">Agoda</option>
                    <option value="onsite">Onsite</option>
                    <option value="online">Online</option>
                    <option value="referral">Referral</option>
                    <option value="airbnb">Airbnb</option>
                    <option value="Vrbo">Vrbo</option>
                    <option value="Oobo">Oobo</option>
                    <option value="Guesty">Guesty</option>
                    <option value="Pulse">Pulse</option>
                  </select>
                </div>
                <div>
                  <label
                    for="countries"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Payment Status
                  </label>
                  <select
                    id="countries"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  >
                    <option selected>Choose payment status</option>
                    <option value="paid">Paid</option>
                    <option value="not-paid">Not Paid</option>
                    <option value="partially-paid">Partially Paid</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label
                    for="start-date"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Start Date
                  </label>

                  <div class="relative max-w-full">
                    <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                      <svg
                        class="w-4 h-4 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                      </svg>
                    </div>
                    <input
                      data-datepicker
                      id="default-datepicker-startdate"
                      type="text"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Select start date"
                    />
                  </div>
                </div>
                <div>
                  <label
                    for="money-received"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    (If Paid) Money received from tenant
                  </label>
                  <input
                    type="text"
                    id="money-received"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label
                    for="end-date"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    End Date
                  </label>

                  <div class="relative max-w-full">
                    <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none ">
                      <svg
                        class="w-4 h-4 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                      </svg>
                    </div>
                    <input
                      data-datepicker
                      id="default-datepicker-enddate"
                      type="text"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Select end date"
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Roomsform;
