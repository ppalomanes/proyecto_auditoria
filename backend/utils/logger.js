const db = require('../config/db');

exports.logAction = async (user_id, action, ip_address) => {
  await db.query("INSERT INTO logs (user_id, action, ip_address) VALUES (?, ?, ?)", [user_id, action, ip_address]);
};
