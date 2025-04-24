#!/bin/bash

echo "🛠️ Iniciando fix y setup automático del backend..."

# Ruta base
PROJECT_DIR="web-backend"

# 1. Crear estructura
mkdir -p $PROJECT_DIR/{routes,controllers,config,uploads}
cd $PROJECT_DIR

# 2. Crear package.json si no existe
if [ ! -f "package.json" ]; then
  echo "📦 Inicializando npm..."
  npm init -y
fi

# 3. Instalar dependencias
echo "📦 Instalando módulos..."
npm install express multer mysql2 papaparse xlsx cors dotenv

# 4. Crear archivos base si no existen
echo "🧱 Generando archivos básicos..."

cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const uploadRoutes = require('./routes/upload');
const dataRoutes = require('./routes/data');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/upload', uploadRoutes);
app.use('/data', dataRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🖥️ Backend corriendo en puerto ${PORT}`));
EOF

cat > routes/upload.js << 'EOF'
const express = require('express');
const multer = require('multer');
const { handleFileUpload } = require('../controllers/fileController');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post('/', upload.single('file'), handleFileUpload);

module.exports = router;
EOF

cat > routes/data.js << 'EOF'
const express = require('express');
const pool = require('../config/db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM uploaded_data');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al recuperar datos');
  }
});

module.exports = router;
EOF

cat > controllers/fileController.js << 'EOF'
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const XLSX = require('xlsx');
const pool = require('../config/db');

const handleFileUpload = async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send('No se subió ningún archivo');

  const ext = path.extname(file.originalname).toLowerCase();
  let data = [];

  try {
    if (ext === '.csv') {
      const content = fs.readFileSync(file.path, 'utf8');
      data = Papa.parse(content, { header: true }).data;
    } else if (ext === '.xlsx' || ext === '.xls') {
      const workbook = XLSX.readFile(file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      data = XLSX.utils.sheet_to_json(sheet);
    } else {
      return res.status(400).send('Formato no soportado');
    }

    const conn = await pool.getConnection();
    const fields = Object.keys(data[0]);
    const placeholders = fields.map(() => '?').join(',');

    for (const row of data) {
      const values = fields.map(field => row[field]);
      await conn.execute(
        `INSERT INTO uploaded_data (${fields.join(',')}) VALUES (${placeholders})`,
        values
      );
    }

    conn.release();
    fs.unlinkSync(file.path);
    res.status(200).send('Archivo procesado y datos guardados');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error procesando archivo');
  }
};

module.exports = { handleFileUpload };
EOF

cat > config/db.js << 'EOF'
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // CAMBIA esto si tienes otro usuario
  password: '', // CAMBIA esto si tienes contraseña
  database: 'dashboard_db',
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;
EOF

# 5. Opcional: PM2 deploy
read -p "¿Quieres ejecutar y persistir con PM2? (s/n): " use_pm2
if [[ "$use_pm2" == "s" || "$use_pm2" == "S" ]]; then
  echo "🚀 Ejecutando con PM2..."
  pm2 start server.js --name dashboard-api
  pm2 save
  pm2 startup | bash
else
  echo "🔁 Puedes iniciar manualmente con: node server.js"
fi

echo "✅ Fix completado. Backend listo para usarse. Verifica la tabla en MySQL y carga desde frontend."
