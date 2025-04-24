const express = require('express');
const cors = require('cors');
const uploadRoutes = require('./routes/upload');
const dataRoutes = require('./routes/data');
const logRoutes = require('./routes/logs');
const authRoutes = require('./routes/auth');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json()); // ¡IMPORTANTE para leer JSON!
app.use('/auth', authRoutes);

app.use('/upload', uploadRoutes);
app.use('/data', dataRoutes);
app.use('/logs', logRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🖥️ Backend escuchando en puerto ${PORT}`));

app.post('/auth/test', (req, res) => {
    res.send("🧪 Test /auth funcionando");
  });