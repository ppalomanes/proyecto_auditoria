const express = require('express');
const pool = require('../config/db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM uploaded_data');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving data');
  }
});

module.exports = router;
