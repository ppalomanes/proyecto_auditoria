// endpoint tipo /logs para consultar acciones por usuario/fecha/rol
// 
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const checkAuth = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// GET /logs?user_id=&action=&from=&to=
router.get('/', checkAuth, checkRole('admin', 'auditor_general'), async (req, res) => {
  const { user_id, action, from, to } = req.query;

  let sql = "SELECT logs.*, users.name, users.email FROM logs LEFT JOIN users ON logs.user_id = users.id WHERE 1=1";
  const params = [];

  if (user_id) {
    sql += " AND logs.user_id = ?";
    params.push(user_id);
  }

  if (action) {
    sql += " AND logs.action = ?";
    params.push(action);
  }

  if (from) {
    sql += " AND logs.created_at >= ?";
    params.push(from);
  }

  if (to) {
    sql += " AND logs.created_at <= ?";
    params.push(to);
  }

  sql += " ORDER BY logs.created_at DESC";

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener logs:', err);
    res.status(500).send("Error al obtener logs");
  }
});

module.exports = router;
