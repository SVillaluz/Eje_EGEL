import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
  try {
    console.log('🔄 Intentando conectar a MongoDB...');
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ ¡Conexión exitosa a MongoDB Atlas!');

    // Listar bases de datos
    const databases = await client.db().admin().listDatabases();
    console.log('📊 Bases de datos disponibles:', databases.databases.map(db => db.name));

    await client.close();
    console.log('🔌 Conexión cerrada');
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.log('\n💡 Posibles soluciones:');
    console.log('1. Verifica tu usuario y contraseña en MongoDB Atlas');
    console.log('2. Verifica que tu IP esté permitida en Network Access');
    console.log('3. Verifica que la URI tenga el formato correcto');
  }
}

testConnection();