import * as xlsx from 'xlsx';
import Builder from 'xmlbuilder2';

export const parseExcel = (filePath: string) => {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    return xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
};

export const validateColumns = (data: any[]) => {
    const requiredColumns = ['egm', 'total$'];

    // Verificar que las columnas existan
    const columns = Object.keys(data[0]);
    for (const col of requiredColumns) {
        if (!columns.includes(col)) {
            return { isValid: false, message: `Falta la columna requerida: ${col}` };
        }
    }

    // Validar que no existan duplicados en 'egm'
    const egmValues = data.map((row) => row['egm']);
    if (new Set(egmValues).size !== egmValues.length) {
        return { isValid: false, message: "La columna 'egm' tiene valores duplicados" };
    }

    // Validar que los valores sean numéricos y no negativos
    for (const row of data) {
        if (typeof row['egm'] !== 'number' || row['egm'] < 0) {
            return { isValid: false, message: "La columna 'egm' tiene valores no válidos" };
        }
        if (typeof row['total$'] !== 'number' || row['total$'] < 0) {
            return { isValid: false, message: "La columna 'total$' tiene valores no válidos" };
        }
    }

    return { isValid: true, message: '' };
};

export const generateXML = (data: any[]) => {
    const root = Builder.create('export');
    const collection = root.ele('collection', { date: '2024-11-20', time: '06:35', processed: 'no' });

    const egms = collection.ele('egms');
    data.forEach((row) => {
        const egm = egms.ele('egm', { id: row['egm'].toString() });
        const bills = egm.ele('bills', { currency: 'ARS' });
        // Simular lógica de denominaciones
        bills.ele('bill', { denom: '100' }).txt('5');
    });

    return root.end({ prettyPrint: true });
};
