const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

exports.sendVerificationEmail = async (to, token) => {
  const link = `http://localhost:3001/auth/verify/${token}`;

  const info = await transporter.sendMail({
    from: `"Auditoría Teco 👁️" <${process.env.SMTP_USER}>`,
    to,
    subject: "📧 Verificación de cuenta",
    html: `
      <h3>Hola!</h3>
      <p>Gracias por registrarte. Verificá tu email haciendo clic aquí:</p>
      <a href="${link}">${link}</a>
      <p>Si no creaste esta cuenta, ignorá este mensaje.</p>
    `
  });

  console.log(`📧 Verificación enviada a ${to}: ${info.messageId}`);
};

exports.sendPasswordResetEmail = async (to, token) => {
  const url = `${process.env.APP_URL}/frontend/reset-password.html?token=${token}`;
  await transporter.sendMail({
    from: `"Soporte Auditoría" <${process.env.SMTP_USER}>`,
    to,
    subject: "🔐 Recuperación de contraseña",
    html: `
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p>Hacé clic en el siguiente link para continuar (expira en 30 minutos):</p>
      <a href="${url}">${url}</a>
    `
  });
};
