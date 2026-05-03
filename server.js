import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// CONFIGURACIÓN
const MONGODB_URI = process.env.MONGODB_URI;
const SECRET = process.env.JWT_SECRET || "secreto_egel";

let db;

// CONEXIÓN A MONGO
async function connectDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();

    db = client.db("egel_db");

    console.log("✅ MongoDB conectado");
  } catch (error) {
    console.error("❌ Error MongoDB:", error.message);
    process.exit(1);
  }
}

// HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "Servidor funcionando",
  });
});

// REGISTRO
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // VALIDACIONES
    if (!username || !email || !password) {
      return res.status(400).json({
        error: "Todos los campos son obligatorios",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "La contraseña debe tener mínimo 6 caracteres",
      });
    }

    // REVISAR SI YA EXISTE EMAIL
    const existeEmail = await db.collection("users").findOne({
      email: email.toLowerCase(),
    });

    if (existeEmail) {
      return res.status(400).json({
        error: "El correo ya está registrado",
      });
    }

    // REVISAR SI YA EXISTE USERNAME
    const existeUsername = await db.collection("users").findOne({
      username,
    });

    if (existeUsername) {
      return res.status(400).json({
        error: "El username ya existe",
      });
    }

    // HASH PASSWORD
    const hash = await bcrypt.hash(password, 10);

    // CREAR USUARIO
    const nuevoUsuario = {
      username,
      email: email.toLowerCase(),
      password: hash,
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(nuevoUsuario);

    // RESPUESTA
    res.json({
      message: "Usuario registrado correctamente",
      user: {
        id: result.insertedId,
        username,
        email,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // VALIDAR CAMPOS
    if (!email || !password) {
      return res.status(400).json({
        error: "Completa todos los campos",
      });
    }

    // BUSCAR USUARIO
    const user = await db.collection("users").findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        error: "Usuario no encontrado",
      });
    }

    // VALIDAR PASSWORD
    const passwordCorrecta = await bcrypt.compare(password, user.password);

    if (!passwordCorrecta) {
      return res.status(401).json({
        error: "Contraseña incorrecta",
      });
    }

    // TOKEN
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      SECRET,
      {
        expiresIn: "1d",
      },
    );

    // RESPUESTA
    res.json({
      message: "Login correcto",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// OBTENER 2 PREGUNTAS POR SUBÁREA
app.get("/api/preguntas/random", async (req, res) => {
  try {
    const subareas = await db.collection("preguntas").distinct("subarea");

    let resultado = [];

    for (const sub of subareas) {
      const preguntas = await db
        .collection("preguntas")
        .aggregate([
          {
            $match: {
              subarea: sub,
            },
          },
          {
            $sample: {
              size: 2,
            },
          },
        ])
        .toArray();

      resultado.push(...preguntas);
    }

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// GUARDAR RESPUESTAS DEL EXAMEN
app.post("/api/respuestas", async (req, res) => {
  try {
    const { userId, respuestas, puntaje } = req.body;

    if (!userId || !respuestas) {
      return res.status(400).json({
        error: "Datos incompletos",
      });
    }

    const nuevoResultado = {
      userId: new ObjectId(userId),
      respuestas,
      puntaje: puntaje || 0,
      fecha: new Date(),
    };

    await db.collection("resultados").insertOne(nuevoResultado);

    res.json({
      message: "Respuestas guardadas correctamente",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// VER RESULTADOS DE UN USUARIO
app.get("/api/resultados/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const resultados = await db
      .collection("resultados")
      .find({
        userId: new ObjectId(userId),
      })
      .sort({ fecha: -1 })
      .toArray();

    res.json(resultados);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// INICIAR SERVIDOR
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Backend corriendo en puerto ${PORT}`);
  });
});
