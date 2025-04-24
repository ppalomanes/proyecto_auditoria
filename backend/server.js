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
app.listen(PORT, () => console.log(`🖥️ Backend escuchando en puerto ${PORT}`));
