@echo off
echo [*] Iniciando configuracion del backend Node.js...

set "PROJECT_DIR=web-backend"
cd /d "%~dp0"

rem 1. Crear estructura
mkdir %PROJECT_DIR%\routes
mkdir %PROJECT_DIR%\controllers
mkdir %PROJECT_DIR%\config
mkdir %PROJECT_DIR%\uploads

cd %PROJECT_DIR%

rem 2. Crear package.json si no existe
if not exist "package.json" (
  echo [*] Inicializando npm...
  call npm init -y
)

rem 3. Instalar dependencias
echo [*] Instalando dependencias...
call npm install express multer mysql2 papaparse xlsx cors dotenv

rem 4. Crear archivos base
echo [*] Generando server.js...
(
echo const express = require('express');
echo const cors = require('cors');
echo const uploadRoutes = require('./routes/upload');
echo const dataRoutes = require('./routes/data');
echo require('dotenv').config();
echo.
echo const app = express();
echo app.use(cors());
echo app.use(express.json());
echo.
echo app.use('/upload', uploadRoutes);
echo app.use('/data', dataRoutes);
echo.
echo const PORT = process.env.PORT || 3001;
echo app.listen(PORT, () => console.log(`🖥️ Backend corriendo en puerto ${PORT}`));
) > server.js

echo [*] Creando rutas...

rem RUTA upload.js
(
echo const express = require('express');
echo const multer = require('multer');
echo const { handleFileUpload } = require('../controllers/fileController');
echo.
echo const upload = multer({ dest: 'uploads/' });
echo const router = express.Router();
echo.
echo router.post('/', upload.single('file'), handleFileUpload);
echo.
echo module.exports = router;
) > routes\upload.js

rem RUTA data.js
(
echo const express = require('express');
echo const pool = require('../config/db');
echo const router = express.Router();
echo.
echo router.get('/', async (req, res) => {
echo ^  try {
echo ^    const [rows] = await pool.query('SELECT * FROM uploaded_data');
echo ^    res.json(rows);
echo ^  } catch (err) {
echo ^    console.error(err);
echo ^    res.status(500).send('Error al recuperar datos');
echo ^  }
echo });
echo.
echo module.exports = router;
) > routes\data.js

rem CONTROLLER fileController.js
(
echo const fs = require('fs');
echo const path = require('path');
echo const Papa = require('papaparse');
echo const XLSX = require('xlsx');
echo const pool = require('../config/db');
echo.
echo const handleFileUpload = async (req, res) => {
echo ^  const file = req.file;
echo ^  if (!file) return res.status(400).send('No se subio ningun archivo');
echo.
echo ^  const ext = path.extname(file.originalname).toLowerCase();
echo ^  let data = [];
echo.
echo ^  try {
echo ^    if (ext === '.csv') {
echo ^      const content = fs.readFileSync(file.path, 'utf8');
echo ^      data = Papa.parse(content, { header: true }).data;
echo ^    } else if (ext === '.xlsx' ^|^| ext === '.xls') {
echo ^      const workbook = XLSX.readFile(file.path);
echo ^      const sheet = workbook.Sheets[workbook.SheetNames[0]];
echo ^      data = XLSX.utils.sheet_to_json(sheet);
echo ^    } else {
echo ^      return res.status(400).send('Formato no soportado');
echo ^    }
echo.
echo ^    const conn = await pool.getConnection();
echo ^    const fields = Object.keys(data[0]);
echo ^    const placeholders = fields.map(() => '?').join(',');
echo.
echo ^    for (const row of data) {
echo ^      const values = fields.map(field => row[field]);
echo ^      await conn.execute(
echo ^        `INSERT INTO uploaded_data (${fields.join(',')}) VALUES (${placeholders})`,
echo ^        values
echo ^      );
echo ^    }
echo.
echo ^    conn.release();
echo ^    fs.unlinkSync(file.path);
echo ^    res.status(200).send('Archivo procesado y datos guardados');
echo ^  } catch (err) {
echo ^    console.error(err);
echo ^    res.status(500).send('Error procesando archivo');
echo ^  }
echo };
echo.
echo module.exports = { handleFileUpload };
) > controllers\fileController.js

rem DB CONFIG
(
echo const mysql = require('mysql2/promise');
echo.
echo const pool = mysql.createPool({
echo ^  host: 'localhost',
echo ^  user: 'root',
echo ^  password: '',
echo ^  database: 'dashboard_db',
echo ^  waitForConnections: true,
echo ^  connectionLimit: 10
echo });
echo.
echo module.exports = pool;
) > config\db.js

echo [✅] Backend reparado y configurado con éxito.

pause
