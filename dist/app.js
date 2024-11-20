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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const excelUtils_1 = require("./utils/excelUtils");
const XLSX = __importStar(require("xlsx"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, '../dist')));
// Configuración de multer para subir archivos
const upload = (0, multer_1.default)({ dest: 'temp/' });
// Rutas
app.post('/upload', upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const filePath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
        if (!filePath) {
            res.status(400).json({ error: 'No se proporcionó ningún archivo' });
            return; // Solo usamos `return` para evitar que el flujo continúe.
        }
        const excelData = (0, excelUtils_1.parseExcel)(filePath);
        const validationResult = (0, excelUtils_1.validateColumns)(excelData);
        if (!validationResult.isValid) {
            res.status(400).json({ error: validationResult.message });
            return;
        }
        const xmlContent = (0, excelUtils_1.generateXML)(excelData);
        const xmlPath = path_1.default.join(__dirname, '../temp', 'generated.xml');
        fs_1.default.writeFileSync(xmlPath, xmlContent, 'utf-8');
        res.download(xmlPath, 'output.xml');
    }
    catch (error) {
        console.error('Error al procesar el archivo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}));
/* app.get('/example', (req: Request, res: Response) => {
    const examplePath = path.join(__dirname, '../example.xlsx');
    res.download(examplePath, 'example.xlsx');
}); */
app.get('/example', (req, res) => {
    const exampleData = [
        { egm: 101, total$: 2000 },
        { egm: 102, total$: 5000 },
        { egm: 103, total$: 2545 },
    ];
    // Crear un libro de Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exampleData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Example');
    // Guardar el archivo temporalmente
    const tempDir = path_1.default.join(__dirname, '../temp');
    if (!fs_1.default.existsSync(tempDir)) {
        fs_1.default.mkdirSync(tempDir, { recursive: true });
    }
    const tempFilePath = path_1.default.join(tempDir, 'example.xlsx');
    XLSX.writeFile(workbook, tempFilePath);
    // Enviar el archivo al cliente
    res.download(tempFilePath, 'archivo_ejemplo.xlsx', (err) => {
        if (err) {
            console.error('Error al enviar el archivo:', err);
        }
        fs_1.default.unlinkSync(tempFilePath); // Eliminar el archivo temporal después de enviarlo
    });
});
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
