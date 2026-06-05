import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "tu_secreto_jwt_aqui";

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
    console.log("✅ Conectado a MongoDB Atlas");
    db = client.db("egel"); // Base de datos principal
    return db;
  } catch (error) {
    console.error("❌ Error al conectar MongoDB:", error);
    process.exit(1);
  }
};

// Middleware para verificar JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Token requerido" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido" });
    }
    req.user = user;
    next();
  });
};

// Rutas de autenticación
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await db.collection("users").findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({ error: "Usuario o email ya existe" });
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    const newUser = {
      username,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      role: "user", // Puede ser 'admin', 'user', etc.
    };

    const result = await db.collection("users").insertOne(newUser);

    // Crear token JWT
    const token = jwt.sign(
      { userId: result.insertedId, username, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      token,
      user: {
        id: result.insertedId,
        username,
        email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuario
    const user = await db.collection("users").findOne({ username });

    if (!user) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    // Crear token JWT
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rutas protegidas (requieren autenticación)
app.get("/api/user/profile", authenticateToken, async (req, res) => {
  try {
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(req.user.userId) },
      { projection: { password: 0 } }, // Excluir contraseña
    );

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Datos del usuario (cada usuario ve solo sus datos)
app.get("/api/user/data", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const collection = db.collection("user_data");

    const userData = await collection.find({ userId }).toArray();

    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agregar dato del usuario
app.post("/api/user/data", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const collection = db.collection("user_data");

    const newData = {
      ...req.body,
      userId,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(newData);
    res.json({ _id: result.insertedId, ...newData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Solo para administradores
app.get("/api/admin/users", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0 } })
      .toArray();

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Evaluaciones para el admin
app.get("/api/admin/evaluaciones", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const evaluaciones = await db
      .collection("evaluaciones")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "usuario",
          },
        },
        { $unwind: "$usuario" },
        {
          $project: {
            _id: 1,
            fecha: 1,
            resultadoFinal: 1,
            bloques: 1,
            username: "$usuario.username",
            email: "$usuario.email",
          },
        },
        { $sort: { fecha: -1 } },
      ])
      .toArray();

    res.json(evaluaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ranking para el admin
app.get("/api/admin/ranking", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const PASS_THRESHOLD = 60;

    const users = await db
      .collection("evaluaciones")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "usuario",
          },
        },
        { $unwind: "$usuario" },
        {
          $group: {
            _id: "$userId",
            username: { $first: "$usuario.username" },
            email: { $first: "$usuario.email" },
            totalExamenes: { $sum: 1 },
            aprobados: {
              $sum: {
                $cond: [
                  { $gte: ["$resultadoFinal.porcentaje", PASS_THRESHOLD] },
                  1,
                  0,
                ],
              },
            },
            reprobados: {
              $sum: {
                $cond: [
                  { $lt: ["$resultadoFinal.porcentaje", PASS_THRESHOLD] },
                  1,
                  0,
                ],
              },
            },
            promedioPorcentaje: { $avg: "$resultadoFinal.porcentaje" },
            ultimoExamen: { $max: "$fecha" },
          },
        },
        {
          $sort: {
            totalExamenes: -1,
            aprobados: -1,
            promedioPorcentaje: -1,
          },
        },
      ])
      .toArray();

    const ranking = users.map((user) => ({
      userId: user._id,
      username: user.username,
      email: user.email,
      totalExamenes: user.totalExamenes,
      aprobados: user.aprobados,
      reprobados: user.reprobados,
      promedioPorcentaje: Number(user.promedioPorcentaje.toFixed(0)),
      ultimoExamen: user.ultimoExamen,
    }));

    res.json(ranking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rutas públicas
app.get("/api/health", (req, res) => {
  res.json({ status: "✅ Servidor funcionando" });
});

// Iniciar servidor
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  });
});
