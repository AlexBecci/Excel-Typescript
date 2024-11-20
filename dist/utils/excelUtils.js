"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateXML = exports.validateColumns = exports.parseExcel = void 0;
const xlsx = __importStar(require("xlsx"));
const xmlbuilder2_1 = __importDefault(require("xmlbuilder2"));
const parseExcel = (filePath) => {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    return xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
};
exports.parseExcel = parseExcel;
const validateColumns = (data) => {
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
exports.validateColumns = validateColumns;
const generateXML = (data) => {
    const root = xmlbuilder2_1.default.create('export');
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
exports.generateXML = generateXML;
