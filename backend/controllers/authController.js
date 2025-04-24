const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { logAction } = require('../utils/logger');
const { sendVerificationEmail } = require('../utils/mailer');
const crypto = require('crypto');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  const user = rows[0];

  if (!user || !user.is_verified) return res.status(401).send("Usuario no verificado o no existe");

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(403).send("Contraseña incorrecta");

  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '8h' });

  logAction(user.id, 'login', req.ip);
  res.json({ token, role: user.role });
};

exports.verifyEmail = async (req, res) => {
    const { token } = req.params;
  
    const [result] = await db.query("SELECT * FROM users WHERE verification_token = ?", [token]);
    const user = result[0];
  
    if (!user) return res.status(400).send("Token inválido o expirado");
  
    await db.query("UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?", [user.id]);
    await logAction(user.id, 'verificacion_email', req.ip);
  
    res.send("✅ Email verificado correctamente. Ya podés ingresar al sistema.");
  };

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const token = crypto.randomBytes(32).toString("hex");

  try {
    await db.query("INSERT INTO users (name, email, password, role, verification_token) VALUES (?, ?, ?, ?, ?)", [name, email, hashed, role, token]);
    sendVerificationEmail(email, token);
    res.status(201).send("Usuario creado. Se envió un email de verificación.");
  } catch (err) {
    res.status(500).send("Error al registrar usuario");
  }
};

//Forgot Password (solicita recuperación)
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  const user = rows[0];

  if (!user) return res.status(404).send("Usuario no encontrado");

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 mins

  await db.query("UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?", [token, expires, user.id]);
  await sendPasswordResetEmail(user.email, token);

  res.send("📧 Email de recuperación enviado");
};

//Reset Password (establece nueva contraseña)
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  const [rows] = await db.query("SELECT * FROM users WHERE reset_token = ? AND reset_expires > NOW()", [token]);
  const user = rows[0];
  if (!user) return res.status(400).send("Token inválido o expirado");

  const hashed = await bcrypt.hash(password, 10);
  await db.query("UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?", [hashed, user.id]);

  await logAction(user.id, 'reset_password', req.ip);
  res.send("✅ Contraseña actualizada correctamente");
};
