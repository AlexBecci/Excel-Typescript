import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { parseExcel, validateColumns, generateXML } from './utils/excelUtils';
import * as XLSX from 'xlsx';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, '../dist')));

// Configuración de multer para subir archivos
const upload = multer({ dest: 'temp/' });

// Rutas
app.post('/upload', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
    try {
        const filePath = req.file?.path;
        if (!filePath) {
            res.status(400).json({ error: 'No se proporcionó ningún archivo' });
            return; // Solo usamos `return` para evitar que el flujo continúe.
        }

        const excelData = parseExcel(filePath);
        const validationResult = validateColumns(excelData);

        if (!validationResult.isValid) {
            res.status(400).json({ error: validationResult.message });
            return;
        }

        const xmlContent = generateXML(excelData);
        const xmlPath = path.join(__dirname, '../temp', 'generated.xml');

        fs.writeFileSync(xmlPath, xmlContent, 'utf-8');
        res.download(xmlPath, 'output.xml');
    } catch (error) {
        console.error('Error al procesar el archivo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/* app.get('/example', (req: Request, res: Response) => {
    const examplePath = path.join(__dirname, '../example.xlsx');
    res.download(examplePath, 'example.xlsx');
}); */

app.get('/example', (req: Request, res: Response) => {
    const exampleData = [
        { egm: 101, total$: 2000},
        { egm: 102, total$: 5000 },
        { egm: 103, total$: 2545 },
    ];

    // Crear un libro de Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exampleData);

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Example');

    // Guardar el archivo temporalmente
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, 'example.xlsx');
    XLSX.writeFile(workbook, tempFilePath);

    // Enviar el archivo al cliente
    res.download(tempFilePath, 'archivo_ejemplo.xlsx', (err) => {
        if (err) {
            console.error('Error al enviar el archivo:', err);
        }
        fs.unlinkSync(tempFilePath); // Eliminar el archivo temporal después de enviarlo
    });
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
