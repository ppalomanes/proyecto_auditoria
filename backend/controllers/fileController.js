const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const XLSX = require('xlsx');
const pool = require('../config/db');

const normalize = str => str
  .normalize("NFD").replace(/[\u0300-\u036f]/g, '') // remove accents
  .replace(/[^\w\s]/gi, '')                         // remove special symbols
  .replace(/\s+/g, '_')                             // replace spaces with _
  .toLowerCase();

const handleFileUpload = async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send('No se subió ningún archivo');

  const ext = path.extname(file.originalname).toLowerCase();
  let data = [];

  try {
    // 🧠 Parse file
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

    if (!data.length) return res.status(400).send('El archivo está vacío');

    const originalFields = Object.keys(data[0]);
    const fieldMap = originalFields.reduce((acc, field) => {
      acc[field] = normalize(field);
      return acc;
    }, {});

    const escapedFields = Object.values(fieldMap).map(f => `\`${f}\``);
    const placeholders = originalFields.map(() => '?').join(',');

    const conn = await pool.getConnection();

    // 🛠️ Crear tabla dinámica si no existe
    const tableExists = await conn.query("SHOW TABLES LIKE 'uploaded_data'");
    if (!tableExists[0].length) {
      const columnsDef = Object.values(fieldMap).map(col => `\`${col}\` TEXT`).join(', ');
      const createSQL = `CREATE TABLE uploaded_data (id INT AUTO_INCREMENT PRIMARY KEY, ${columnsDef})`;
      await conn.query(createSQL);
      console.log('🧱 Tabla uploaded_data creada automáticamente');
    }

    // 📝 Insertar datos
    for (const row of data) {
      const values = originalFields.map(f => {
        const val = row[f];
        return val === undefined || typeof val === 'undefined' ? null : val;
      });
      
      await conn.execute(
        `INSERT INTO uploaded_data (${escapedFields.join(',')}) VALUES (${placeholders})`,
        values
      );
    }

    conn.release();
    fs.unlinkSync(file.path);
    res.status(200).send('Archivo procesado, tabla creada si era necesario, y datos insertados');
  } catch (err) {
    console.error('🔥 Error:', err);
    res.status(500).send('Error procesando archivo: ' + err.message);
  }
};

module.exports = { handleFileUpload };
