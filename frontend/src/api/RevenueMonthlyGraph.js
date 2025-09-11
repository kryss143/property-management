import ApexCharts from "apexcharts";

const options = {
  colors: ["#1A56DB", "#FDBA8C"],
  series: [
    {
      name: "Organic",
      color: "#1A56DB",
      data: [
        { x: "Jan", y: 231 },
        { x: "Feb", y: 122 },
        { x: "Mar", y: 63 },
        { x: "Apr", y: 421 },
        { x: "May", y: 122 },
        { x: "Jun", y: 323 },
        { x: "Jul", y: 111 },
      ],
    },
    {
      name: "Social media",
      color: "#FDBA8C",
      data: [
        { x: "Jan", y: 232 },
        { x: "Feb", y: 113 },
        { x: "Mar", y: 341 },
        { x: "Apr", y: 224 },
        { x: "May", y: 522 },
        { x: "Jun", y: 411 },
        { x: "Jul", y: 243 },
      ],
    },
  ],
  chart: {
    type: "bar",
    height: "320px",
    fontFamily: "Inter, sans-serif",
    toolbar: {
      show: false,
    },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: "70%",
      borderRadiusApplication: "end",
      borderRadius: 8,
    },
  },
  tooltip: {
    shared: true,
    intersect: false,
    style: {
      fontFamily: "Inter, sans-serif",
    },
  },
  states: {
    hover: {
      filter: {
        type: "darken",
        value: 1,
      },
    },
  },
  stroke: {
    show: true,
    width: 0,
    colors: ["transparent"],
  },
  grid: {
    show: false,
    strokeDashArray: 4,
    padding: {
      left: 2,
      right: 2,
      top: -14,
    },
  },
  dataLabels: {
    enabled: false,
  },
  legend: {
    show: false,
  },
  xaxis: {
    floating: false,
    labels: {
      show: true,
      style: {
        fontFamily: "Inter, sans-serif",
        cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
      },
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    show: false,
  },
  fill: {
    opacity: 1,
  },
};

export function loadMonthlyColumnGraph() {
  if (
    document.getElementById("column-chart-monthly") &&
    typeof ApexCharts !== "undefined"
  ) {
    const chart = new ApexCharts(
      document.getElementById("column-chart-monthly"),
      options
    );
    chart.render();
  }
}
