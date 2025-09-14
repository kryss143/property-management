import { DataTable } from "simple-datatables";

export function loadInventoryTable() {
  if (
    document.getElementById("inventory-default-table") &&
    typeof DataTable !== "undefined"
  ) {
    let dataTable = new DataTable("#inventory-default-table", {
      sortable: true, // enable or disable sorting
      locale: "en-US", // set the locale for sorting
      numeric: true, // enable or disable numeric sorting
      caseFirst: "false", // set the case first for sorting (upper, lower)
      ignorePunctuation: true,

      paging: true,
      perPageSelect: [5, 10, 15, 20, 25],
      perPage: 10,

      searchable: true, // enable or disable searching
      sensitivity: "base", // set the search sensitivity (base, accent, case, variant)
      searchQuerySeparator: " ",
      labels: {
        placeholder: "Search Inventory...", // The search input placeholder
        perPage: "entries per page",
        noRows: "No entries found",
        noResults: "No results found",
      },
    });
    dataTable.init();
  }
}
