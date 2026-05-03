import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function createAdminUser() {
  try {
    console.log("🔄 Conectando a MongoDB...");
    const client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db("egel");

    // Verificar si ya existe un admin
    const existingAdmin = await db
      .collection("users")
      .findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("⚠️  Ya existe un usuario admin");
      console.log("Usuario:", existingAdmin.username);
      console.log("Email:", existingAdmin.email);
      return;
    }

    // Crear usuario admin
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("admin123", saltRounds);

    const adminUser = {
      username: "admin",
      email: "admin@egel.com",
      password: hashedPassword,
      role: "admin",
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(adminUser);

    console.log("✅ Usuario admin creado exitosamente!");
    console.log("Usuario: admin");
    console.log("Contraseña: admin123");
    console.log("Email: admin@egel.com");

    await client.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

createAdminUser();
