import { useEffect, useState } from "react";
import { initFlowbite } from "flowbite";
import { loadInventoryTable } from "../../api/InventoryTable.js";

const InventoryStats = () => {
  // State for controlling accordion behavior
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [openAccordions, setOpenAccordions] = useState({
    accordion1: false,
    accordion2: false,
    accordion3: false,
    accordion4: false,
  });

  // Handle checkbox change for allowing multiple accordions
  const handleAllowMultipleChange = (e) => {
    const checked = e.target.checked;
    setAllowMultiple(checked);

    if (checked) {
      // When allowing multiple, open all accordions by default
      setOpenAccordions({
        accordion1: true,
        accordion2: true,
        accordion3: true,
        accordion4: true,
      });
    } else {
      // When switching back to single mode, close all accordions
      setOpenAccordions({
        accordion1: false,
        accordion2: false,
        accordion3: false,
        accordion4: false,
      });
    }
  };

  // Handle accordion toggle
  const toggleAccordion = (accordionId) => {
    if (allowMultiple) {
      // Allow multiple accordions to be open
      setOpenAccordions((prev) => ({
        ...prev,
        [accordionId]: !prev[accordionId],
      }));
    } else {
      // Only allow one accordion to be open at a time
      setOpenAccordions((prev) => {
        const newState = {
          accordion1: false,
          accordion2: false,
          accordion3: false,
          accordion4: false,
        };
        newState[accordionId] = !prev[accordionId];
        return newState;
      });
    }
  };

  useEffect(() => {
    initFlowbite();
    loadInventoryTable();
  }, []);

  return (
    <>
      <div className="p-2 sm:ml-64">
        <div className="p-2 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
          <div className="p-4 rounded-sm bg-gray-50 dark:bg-gray-800 mb-3">
            <p className="text-2xl font-semibold leading-none text-gray-900 dark:text-white">
              Inventory
            </p>
          </div>
          <div className="p-4 rounded-sm bg-gray-50 dark:bg-gray-800 mb-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-lg font-normal italic leading-none text-gray-900 dark:text-white">
                Legend:
              </p>
              <div className="flex items-center">
                <input
                  id="allow-multiple"
                  type="checkbox"
                  checked={allowMultiple}
                  onChange={handleAllowMultipleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="allow-multiple"
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Allow multiple open
                </label>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {/* First Accordion - Property Types */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <h2>
                  <button
                    type="button"
                    className="flex items-center justify-between w-full p-2 font-medium rtl:text-right text-gray-500 border-0 rounded-t-lg dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-gray-800 gap-3"
                    onClick={() => toggleAccordion("accordion1")}
                    aria-expanded={openAccordions.accordion1}
                  >
                    <span>Property Types</span>
                    <svg
                      className={`w-3 h-3 shrink-0 transition-transform duration-200 ${
                        openAccordions.accordion1 ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 10 6"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5 5 1 1 5"
                      />
                    </svg>
                  </button>
                </h2>
                <div
                  className={`${
                    openAccordions.accordion1 ? "block" : "hidden"
                  } transition-all duration-200`}
                >
                  <div className="p-5 border-t border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                    <div className="grid grid-flow-row gap-4">
                      <div className="max-w-xl p-2 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex items-center justify-start gap-2">
                          <div className="h-5 w-15 bg-green-500"></div>
                          <p className="text-gray-900 dark:text-white">Rooms</p>
                        </div>
                      </div>
                      <div className="max-w-xl p-2 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex items-center justify-start gap-2">
                          <div className="h-5 w-15 bg-yellow-300"></div>
                          <p className="text-gray-900 dark:text-white">
                            Townhouses
                          </p>
                        </div>
                      </div>
                      <div className="max-w-xl p-2 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex items-center justify-start gap-2">
                          <div className="h-5 w-15 bg-blue-500"></div>
                          <p className="text-gray-900 dark:text-white">
                            Staffhouses
                          </p>
                        </div>
                      </div>
                      <div className="max-w-xl p-2 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex items-center justify-start gap-2">
                          <div className="h-5 w-15 bg-purple-500"></div>
                          <p className="text-gray-900 dark:text-white">
                            Apartments
                          </p>
                        </div>
                      </div>
                      <div className="max-w-xl p-2 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex items-center justify-start gap-2">
                          <div className="h-5 w-15 bg-red-500"></div>
                          <p className="text-gray-900 dark:text-white">
                            Boarding Houses
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Second Accordion - Property Duration */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <h2>
                  <button
                    type="button"
                    className="flex items-center justify-between w-full p-2 font-medium rtl:text-right text-gray-500 border-0 rounded-t-lg dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-gray-800 gap-3"
                    onClick={() => toggleAccordion("accordion2")}
                    aria-expanded={openAccordions.accordion2}
                  >
                    <span>Property Duration</span>
                    <svg
                      className={`w-3 h-3 shrink-0 transition-transform duration-200 ${
                        openAccordions.accordion2 ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 10 6"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5 5 1 1 5"
                      />
                    </svg>
                  </button>
                </h2>
                <div
                  className={`${
                    openAccordions.accordion2 ? "block" : "hidden"
                  } transition-all duration-200`}
                >
                  <div className="p-5 border-t border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                    <div className="grid grid-flow-row gap-4">
                      <div className="max-w-xl p-2 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex items-center justify-start gap-2">
                          <div className="h-5 w-15 bg-orange-500"></div>
                          <p className="text-gray-900 dark:text-white">
                            Short Term (1-6 months)
                          </p>
                        </div>
                      </div>
                      <div className="max-w-xl p-2 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex items-center justify-start gap-2">
                          <div className="h-5 w-15 bg-teal-500"></div>
                          <p className="text-gray-900 dark:text-white">
                            Long Term (6+ months)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Third Accordion - Property Status */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <h2>
                  <button
                    type="button"
                    className="flex items-center justify-between w-full p-2 font-medium rtl:text-right text-gray-500 border-0 rounded-t-lg dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-gray-800 gap-3"
                    onClick={() => toggleAccordion("accordion3")}
                    aria-expanded={openAccordions.accordion3}
                  >
                    <span>Property Status</span>
                    <svg
                      className={`w-3 h-3 shrink-0 transition-transform duration-200 ${
                        openAccordions.accordion3 ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 10 6"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5 5 1 1 5"
                      />
                    </svg>
                  </button>
                </h2>
                <div
                  className={`${
                    openAccordions.accordion3 ? "block" : "hidden"
                  } transition-all duration-200`}
                >
                  <div className="p-5 border-t border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                    <div className="grid grid-flow-row gap-4">
                      <div className="max-w-xl p-2 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex items-center justify-start gap-2">
                          <div className="h-5 w-15 bg-emerald-600"></div>
                          <p className="text-gray-900 dark:text-white">
                            Available
                          </p>
                        </div>
                      </div>
                      <div className="max-w-xl p-2 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex items-center justify-start gap-2">
                          <div className="h-5 w-15 bg-red-500"></div>
                          <p className="text-gray-900 dark:text-white">
                            Occupied
                          </p>
                        </div>
                      </div>
                      <div className="max-w-xl p-2 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex items-center justify-start gap-2">
                          <div className="h-5 w-15 bg-yellow-500"></div>
                          <p className="text-gray-900 dark:text-white">
                            Under Maintenance
                          </p>
                        </div>
                      </div>
                      <div className="max-w-xl p-2 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex items-center justify-start gap-2">
                          <div className="h-5 w-15 bg-gray-500"></div>
                          <p className="text-gray-900 dark:text-white">
                            Reserved
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fourth Accordion - Booking Types */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <h2>
                  <button
                    type="button"
                    className="flex items-center justify-between w-full p-2 font-medium rtl:text-right text-gray-500 border-0 rounded-t-lg dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-gray-800 gap-3"
                    onClick={() => toggleAccordion("accordion4")}
                    aria-expanded={openAccordions.accordion4}
                  >
                    <span>Booking Types</span>
                    <svg
                      className={`w-3 h-3 shrink-0 transition-transform duration-200 ${
                        openAccordions.accordion4 ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 10 6"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5 5 1 1 5"
                      />
                    </svg>
                  </button>
                </h2>
                <div
                  className={`${
                    openAccordions.accordion4 ? "block" : "hidden"
                  } transition-all duration-200`}
                >
                  <div className="p-5 border-t border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                    <div className="grid grid-flow-row gap-4">
                      <div className="max-w-xl p-2 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex items-center justify-start gap-2">
                          <div className="h-5 w-15 bg-blue-300"></div>
                          <p className="text-gray-900 dark:text-white">
                            Agoda
                          </p>
                        </div>
                      </div>
                      <div className="max-w-xl p-2 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex items-center justify-start gap-2">
                          <div className="h-5 w-15 bg-red-300"></div>
                          <p className="text-gray-900 dark:text-white">
                            Onsite
                          </p>
                        </div>
                      </div>
                      <div className="max-w-xl p-2 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex items-center justify-start gap-2">
                          <div className="h-5 w-15 bg-teal-300"></div>
                          <p className="text-gray-900 dark:text-white">
                            Online
                          </p>
                        </div>
                      </div>
                      <div className="max-w-xl p-2 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex items-center justify-start gap-2">
                          <div className="h-5 w-15 bg-cyan-300"></div>
                          <p className="text-gray-900 dark:text-white">
                            Referral
                          </p>
                        </div>
                      </div>
                      <div className="max-w-xl p-2 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex items-center justify-start gap-2">
                          <div className="h-5 w-15 bg-indigo-300"></div>
                          <p className="text-gray-900 dark:text-white">
                            Airbnb
                          </p>
                        </div>
                      </div>
                      <div className="max-w-xl p-2 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex items-center justify-start gap-2">
                          <div className="h-5 w-15 bg-fuchsia-300"></div>
                          <p className="text-gray-900 dark:text-white">
                            Vrbo
                          </p>
                        </div>
                      </div>
                      <div className="max-w-xl p-2 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex items-center justify-start gap-2">
                          <div className="h-5 w-15 bg-amber-300"></div>
                          <p className="text-gray-900 dark:text-white">
                            Oobo
                          </p>
                        </div>
                      </div>
                      <div className="max-w-xl p-2 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex items-center justify-start gap-2">
                          <div className="h-5 w-15 bg-lime-300"></div>
                          <p className="text-gray-900 dark:text-white">
                            Guesty
                          </p>
                        </div>
                      </div>
                      <div className="max-w-xl p-2 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex items-center justify-start gap-2">
                          <div className="h-5 w-15 bg-orange-300"></div>
                          <p className="text-gray-900 dark:text-white">
                            Pulse
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
          <div className="p-4 h-full rounded-sm bg-gray-50 dark:bg-gray-800">
            <table id="inventory-default-table" className="border-gray-800 w-full">
              <thead>
                <tr>
                  <th>
                    <span className="flex items-center">
                      Name
                      <svg
                        className="w-4 h-4 ms-1"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m8 15 4 4 4-4m0-6-4-4-4 4"
                        />
                      </svg>
                    </span>
                  </th>
                  <th data-type="date" data-format="YYYY/DD/MM">
                    <span className="flex items-center">
                      Release Date
                      <svg
                        className="w-4 h-4 ms-1"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m8 15 4 4 4-4m0-6-4-4-4 4"
                        />
                      </svg>
                    </span>
                  </th>
                  <th>
                    <span className="flex items-center">
                      NPM Downloads
                      <svg
                        className="w-4 h-4 ms-1"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m8 15 4 4 4-4m0-6-4-4-4 4"
                        />
                      </svg>
                    </span>
                  </th>
                  <th>
                    <span className="flex items-center">
                      Growth
                      <svg
                        className="w-4 h-4 ms-1"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m8 15 4 4 4-4m0-6-4-4-4 4"
                        />
                      </svg>
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Flowbite
                  </td>
                  <td>2021/25/09</td>
                  <td>269000</td>
                  <td>49%</td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    React
                  </td>
                  <td>2013/24/05</td>
                  <td>4500000</td>
                  <td>24%</td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Angular
                  </td>
                  <td>2010/20/09</td>
                  <td>2800000</td>
                  <td>17%</td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Vue
                  </td>
                  <td>2014/12/02</td>
                  <td>3600000</td>
                  <td>30%</td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Svelte
                  </td>
                  <td>2016/26/11</td>
                  <td>1200000</td>
                  <td>57%</td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Ember
                  </td>
                  <td>2011/08/12</td>
                  <td>500000</td>
                  <td>44%</td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Backbone
                  </td>
                  <td>2010/13/10</td>
                  <td>300000</td>
                  <td>9%</td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    jQuery
                  </td>
                  <td>2006/28/01</td>
                  <td>6000000</td>
                  <td>5%</td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Bootstrap
                  </td>
                  <td>2011/19/08</td>
                  <td>1800000</td>
                  <td>12%</td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Foundation
                  </td>
                  <td>2011/23/09</td>
                  <td>700000</td>
                  <td>8%</td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Bulma
                  </td>
                  <td>2016/24/10</td>
                  <td>500000</td>
                  <td>7%</td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Next.js
                  </td>
                  <td>2016/25/10</td>
                  <td>2300000</td>
                  <td>45%</td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Nuxt.js
                  </td>
                  <td>2016/16/10</td>
                  <td>900000</td>
                  <td>50%</td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Meteor
                  </td>
                  <td>2012/17/01</td>
                  <td>1000000</td>
                  <td>10%</td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Aurelia
                  </td>
                  <td>2015/08/07</td>
                  <td>200000</td>
                  <td>20%</td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Inferno
                  </td>
                  <td>2016/27/09</td>
                  <td>100000</td>
                  <td>35%</td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Preact
                  </td>
                  <td>2015/16/08</td>
                  <td>600000</td>
                  <td>28%</td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Lit
                  </td>
                  <td>2018/28/05</td>
                  <td>400000</td>
                  <td>60%</td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Alpine.js
                  </td>
                  <td>2019/02/11</td>
                  <td>300000</td>
                  <td>70%</td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Stimulus
                  </td>
                  <td>2018/06/03</td>
                  <td>150000</td>
                  <td>25%</td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Solid
                  </td>
                  <td>2021/05/07</td>
                  <td>250000</td>
                  <td>80%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default InventoryStats;
