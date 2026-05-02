import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI;
let db;

const connectDB = async () => {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado a MongoDB Atlas');
    db = client.db('egel'); // Reemplaza con el nombre de tu BD
    return db;
  } catch (error) {
    console.error('❌ Error al conectar MongoDB:', error);
    process.exit(1);
  }
};

// Rutas API
app.get('/api/health', (req, res) => {
  res.json({ status: '✅ Servidor funcionando' });
});

// Ejemplo: Obtener datos de una colección
app.get('/api/datos', async (req, res) => {
  try {
    const collection = db.collection('datos');
    const datos = await collection.find({}).toArray();
    res.json(datos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ejemplo: Insertar un dato
app.post('/api/datos', async (req, res) => {
  try {
    const collection = db.collection('datos');
    const result = await collection.insertOne(req.body);
    res.json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  });
});
