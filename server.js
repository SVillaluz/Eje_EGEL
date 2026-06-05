import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================
// MIDDLEWARE
// ==========================

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;

if (FRONTEND_ORIGIN) {
  const allowed = FRONTEND_ORIGIN.split(",").map((s) => s.trim());

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (allowed.includes("*") || allowed.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error("CORS policy: origin not allowed"));
      },
    }),
  );
} else {
  console.warn(
    "⚠️ FRONTEND_ORIGIN no definido — CORS permitiendo todos los orígenes.",
  );

  app.use(cors());
}

app.use(express.json());

// ==========================
// CONFIG
// ==========================

const MONGODB_URI = process.env.MONGODB_URI;
const SECRET = process.env.JWT_SECRET || "secreto_egel";

let db;

// ==========================
// CONEXIÓN MONGO
// ==========================

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

// ==========================
// MIDDLEWARE ADMIN
// ==========================

const verificarAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Token requerido",
      });
    }

    const decoded = jwt.verify(token, SECRET);

    const usuario = await db.collection("users").findOne({
      _id: new ObjectId(decoded.id),
    });

    if (!usuario || usuario.role !== "admin") {
      return res.status(403).json({
        error: "Acceso denegado",
      });
    }

    req.user = usuario;

    next();
  } catch (error) {
    res.status(401).json({
      error: "Token inválido",
    });
  }
};

// ==========================
// HEALTH CHECK
// ==========================

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "Servidor funcionando",
  });
});

// ==========================
// REGISTER
// ==========================

app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

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

    const existeEmail = await db.collection("users").findOne({
      email: email.toLowerCase(),
    });

    if (existeEmail) {
      return res.status(400).json({
        error: "El correo ya está registrado",
      });
    }

    const existeUsername = await db.collection("users").findOne({
      username,
    });

    if (existeUsername) {
      return res.status(400).json({
        error: "El username ya existe",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const nuevoUsuario = {
      username,
      email: email.toLowerCase(),
      password: hash,
      role: "user",
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(nuevoUsuario);

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

// ==========================
// LOGIN
// ==========================

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Completa todos los campos",
      });
    }

    const user = await db.collection("users").findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        error: "Usuario no encontrado",
      });
    }

    const passwordCorrecta = await bcrypt.compare(password, user.password);

    if (!passwordCorrecta) {
      return res.status(401).json({
        error: "Contraseña incorrecta",
      });
    }

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

    res.json({
      message: "Login correcto",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// ==========================
// OBTENER PREGUNTAS RANDOM
// 6 BLOQUES DE 10 = 60
// ==========================

app.get("/api/preguntas/random", async (req, res) => {
  try {
    const BLOQUES = 6;
    const PREGUNTAS_POR_BLOQUE = 10;
    const TOTAL_PREGUNTAS = BLOQUES * PREGUNTAS_POR_BLOQUE;

    // Obtener preguntas totalmente aleatorias
    const preguntas = await db
      .collection("preguntas")
      .aggregate([
        {
          $sample: {
            size: TOTAL_PREGUNTAS,
          },
        },
      ])
      .toArray();

    // Crear bloques
    const bloques = [];

    for (let i = 0; i < BLOQUES; i++) {
      const inicio = i * PREGUNTAS_POR_BLOQUE;
      const fin = inicio + PREGUNTAS_POR_BLOQUE;

      bloques.push({
        bloque: i + 1,
        preguntas: preguntas.slice(inicio, fin),
      });
    }

    res.json({
      bloques,
    });
  } catch (error) {
    console.error("ERROR RANDOM:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});

// ==========================
// PREGUNTAS POR SUBAREA
// ==========================

app.get("/api/preguntas/by-subarea/:subarea", async (req, res) => {
  try {
    const { subarea } = req.params;

    const size = Math.min(Math.max(parseInt(req.query.size, 10) || 5, 1), 20);

    const excludeIds = (req.query.excludeIds || "").split(",").filter(Boolean);

    const match = {
      subarea,
    };

    if (excludeIds.length > 0) {
      match._id = {
        $nin: excludeIds
          .map((id) => {
            try {
              return new ObjectId(id);
            } catch {
              return null;
            }
          })
          .filter(Boolean),
      };
    }

    const preguntas = await db
      .collection("preguntas")
      .aggregate([
        {
          $match: match,
        },
        {
          $sample: {
            size,
          },
        },
      ])
      .toArray();

    res.json(preguntas);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// ==========================
// GUARDAR RESPUESTAS
// ==========================

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

// ==========================
// VER RESULTADOS USUARIO
// ==========================

app.get("/api/resultados/:userId", verificarAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const resultados = await db
      .collection("resultados")
      .find({
        userId: new ObjectId(userId),
      })
      .sort({
        fecha: -1,
      })
      .toArray();

    res.json(resultados);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// ==========================
// GUARDAR EVALUACIÓN
// ==========================

app.post("/api/resultados/evaluacion", async (req, res) => {
  try {
    const { userId, bloques, respuestas, resultadoFinal } = req.body;

    console.log("BODY RECIBIDO:", req.body);

    if (!userId) {
      return res.status(400).json({
        error: "userId requerido",
      });
    }

    if (!bloques || !respuestas || !resultadoFinal) {
      return res.status(400).json({
        error: "Datos incompletos",
      });
    }

    const bloquesResultado = bloques.map((bloque) => {
      let aciertos = 0;

      const preguntas = bloque.preguntas.map((p) => {
        const respuesta = respuestas[p._id];

        if (respuesta?.correcta) {
          aciertos++;
        }

        return {
          preguntaId: p._id,
          subarea: p.subarea,
          nivel: p.nivel,
          correcta: respuesta?.correcta || false,
          respuestaUsuario: respuesta?.index ?? null,
        };
      });

      return {
        bloque: bloque.bloque,
        aciertos,
        total: bloque.preguntas.length,
        porcentaje: ((aciertos / bloque.preguntas.length) * 100).toFixed(0),
        preguntas,
      };
    });

    const evaluacion = {
      userId: new ObjectId(userId),
      fecha: new Date(),
      resultadoFinal,
      bloques: bloquesResultado,
    };

    const result = await db.collection("evaluaciones").insertOne(evaluacion);

    console.log("Evaluación guardada:", result);

    res.json({
      ok: true,
      message: "Evaluación guardada",
    });
  } catch (error) {
    console.error("ERROR EVALUACION:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});

// ==========================
// ADMIN EVALUACIONES
// ==========================

app.get("/api/admin/evaluaciones", verificarAdmin, async (req, res) => {
  try {
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

        {
          $unwind: "$usuario",
        },

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

        {
          $sort: {
            fecha: -1,
          },
        },
      ])
      .toArray();

    res.json(evaluaciones);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// ==========================
// ADMIN RANKING
// ==========================

app.get("/api/admin/ranking", verificarAdmin, async (req, res) => {
  try {
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
        {
          $unwind: "$usuario",
        },
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

    const temas = await db
      .collection("evaluaciones")
      .aggregate([
        { $unwind: "$bloques" },
        { $unwind: "$bloques.preguntas" },
        {
          $group: {
            _id: {
              userId: "$userId",
              subarea: "$bloques.preguntas.subarea",
            },
            total: { $sum: 1 },
            correctas: {
              $sum: {
                $cond: ["$bloques.preguntas.correcta", 1, 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            userId: "$_id.userId",
            subarea: "$_id.subarea",
            total: 1,
            correctas: 1,
            porcentaje: {
              $round: [
                {
                  $multiply: [
                    { $divide: ["$correctas", "$total"] },
                    100,
                  ],
                },
                0,
              ],
            },
          },
        },
      ])
      .toArray();

    const ranking = users.map((user) => {
      const temasUsuario = temas
        .filter((tema) => tema.userId.toString() === user._id.toString())
        .sort((a, b) => b.porcentaje - a.porcentaje);

      return {
        userId: user._id,
        username: user.username,
        email: user.email,
        totalExamenes: user.totalExamenes,
        aprobados: user.aprobados,
        reprobados: user.reprobados,
        promedioPorcentaje: Number(user.promedioPorcentaje.toFixed(0)),
        ultimoExamen: user.ultimoExamen,
        temasDominados: temasUsuario.filter((tema) => tema.porcentaje >= 70),
        temasPorMejorar: temasUsuario.filter((tema) => tema.porcentaje < 70),
      };
    });

    res.json(ranking);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// ==========================
// INICIAR SERVIDOR
// ==========================

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Backend corriendo en puerto ${PORT}`);
  });
});
