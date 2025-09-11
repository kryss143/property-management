import { DataTable } from "simple-datatables";

export function loadRoomsTable() {
  if (
    document.getElementById("default-table") &&
    typeof DataTable !== "undefined"
  ) {
    let dataTable = new DataTable("#default-table", {
      searchable: false,
      perPageSelect: false,
    });
    dataTable.init();
  }
}
