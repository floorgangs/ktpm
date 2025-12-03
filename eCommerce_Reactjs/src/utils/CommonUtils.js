import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { PREFIX_CURRENCY } from '../utils/constant'
class CommonUtils {
    static getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error)
        })
    }
    static exportExcel(data, nameSheet, nameFile) {
        return new Promise(async (resolve, reject) => {
            try {
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet(nameSheet);
                
                // Add headers from first data object keys
                if (data.length > 0) {
                    const headers = Object.keys(data[0]);
                    worksheet.addRow(headers);
                    
                    // Add data rows
                    data.forEach(item => {
                        worksheet.addRow(Object.values(item));
                    });
                }
                
                // Generate buffer and save
                const buffer = await workbook.xlsx.writeBuffer();
                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                saveAs(blob, `${nameFile}.xlsx`);
                
                resolve('oke');
            } catch (error) {
                reject(error);
            }
        })
    }
    static formatter = new Intl.NumberFormat('en-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: PREFIX_CURRENCY.minimumFractionDigits
    })

}

export default CommonUtils;