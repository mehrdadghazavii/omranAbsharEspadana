import XLSX from "xlsx";
import {store} from "../redux/store";
import {itemsDrawers} from "./items-drawers.utils";
import moment from "jalali-moment";

export const exportExcel = (excelHeaders: [], excelData: [], columnWidths: any) => {

    const states = store.getState();
    const currentTab = states.currentTab;
    const currentPage = states.currentPage;
    const currentTitle = itemsDrawers[currentTab].find((item: any) => item.id === currentPage)?.title;
    const date = moment(Date.now()).locale('fa').format("YYYY-MM-DD HH:mm:ss");

    enum Role {
        CMR = "گزارش جامع",
        SUR = "خلاصه گزارشات",
    }
    const roleTab = currentTab === 1 ? Role.CMR : currentTab === 2 ? Role.SUR : null;

    // Create a new workbook
    const wb = XLSX.utils.book_new();
    // Define data
    const data = [
        excelHeaders,
        ...excelData
    ];
    // Convert data to a worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
    // Set column widths
    ws['!cols'] = columnWidths.map((width: any) => ({ wch: width }));
    //Create Styles
    ws["A1"].s = {
        fill: {
            patternType: "solid",
            bgColor: {rgb: "FFFFFF00"},
            fgColor: {rgb: "FFFFFF00"},
        },
        alignment: {
            vertical: 'center',
            readingOrder : 2
        },
        font: {
            bold: true, color: 'yellow', sz: '10'
        }
    }
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    // Save the workbook as an Excel file
    XLSX.writeFile(wb, `${roleTab}-${currentTitle}-${date}.xlsx`);
}
