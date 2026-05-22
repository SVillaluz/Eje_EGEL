# Ejemplos de Datos y Estructura

## 📋 Estructura de Datos del Resultado

### Objeto `resultado` (después de finalizar examen)

```javascript
{
  total: 40,           // 4 bloques × 10 preguntas
  aciertos: 36,        // preguntas respondidas correctamente
  porcentaje: 90       // (36/40) * 100
}
```

### Array `justificaciones` (respuestas incorrectas)

```javascript
[
  {
    id: "507f1f77bcf86cd799439011",
    subarea: "Protocolos de Red",
    justificacion:
      "TCP es un protocolo orientado a conexión que garantiza la entrega de datos. UDP es sin conexión y no garantiza entrega pero es más rápido.",
  },
  {
    id: "507f1f77bcf86cd799439012",
    subarea: "Seguridad en Redes",
    justificacion:
      "Una VPN (Red Privada Virtual) encripta la conexión permitiendo navegación privada en redes públicas.",
  },
];
```

### Array `bloques` (estructura del examen)

```javascript
[
  {
    _id: "607f1f77bcf86cd799439011",
    nombre: "Fundamentos de Redes",
    preguntas: [
      {
        _id: "507f191e810c19729de860ea",
        pregunta: "¿Cuál es la función principal del protocolo TCP?",
        opciones: [
          "Enrutamiento",
          "Control de flujo de datos",
          "DNS",
          "Encriptación",
        ],
        correcta: 1,
        subarea: "Protocolos",
        nivel: "Básico",
      },
      // ... 9 preguntas más
    ],
  },
  // ... más bloques
];
```

### Objeto `respuestas` (todas las respuestas del usuario)

```javascript
{
  "507f191e810c19729de860ea": {
    opcion: "Control de flujo de datos",
    index: 1,
    correcta: true
  },
  "507f191e810c19729de860eb": {
    opcion: "HTTP",
    index: 0,
    correcta: false
  },
  // ... una entrada por cada pregunta
}
```

---

## 🎯 Ejemplo de Resultado Final (90%)

### Vista del Estudiante

```
╔════════════════════════════════════════════════════════════════╗
║     Resultados de tu Evaluación - Desempeño General           ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║      ┌─────────────────────────┐     ┌────────────────────┐  ║
║      │                         │     │  Aprobado          │  ║
║      │                         │     │                    │  ║
║      │           90%           │     │ Has obtenido una   │  ║
║      │                         │     │ puntuación de 90%  │  ║
║      │         [Círculo       │     │                    │  ║
║      │          azul con      │     │ 36 respuestas      │  ║
║      │          barra]        │     │ correctas de 40    │  ║
║      │                         │     │                    │  ║
║      └─────────────────────────┘     └────────────────────┘  ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║  Desempeño por Módulo                                          ║
║                                                                ║
║  ┌─────────────────────────────┐  ┌─────────────────────────┐ ║
║  │ Módulo 1: Fundamentos       │  │ Módulo 2: Protocolos  │ ║
║  │                             │  │                       │ ║
║  │          95%                │  │         90%           │ ║
║  │                             │  │                       │ ║
║  │ 19 respuestas de 20         │  │ 18 respuestas de 20   │ ║
║  │ [Barra verde al 95%]        │  │ [Barra azul al 90%]   │ ║
║  │                             │  │                       │ ║
║  │ ▼ Ver detalles              │  │ ▼ Ver detalles        │ ║
║  └─────────────────────────────┘  └─────────────────────────┘ ║
║                                                                ║
║  ┌─────────────────────────────┐  ┌─────────────────────────┐ ║
║  │ Módulo 3: Seguridad         │  │ Módulo 4: Aplicaciones│ ║
║  │                             │  │                       │ ║
║  │          90%                │  │         85%           │ ║
║  │                             │  │                       │ ║
║  │ 18 respuestas de 20         │  │ 17 respuestas de 20   │ ║
║  │ [Barra azul al 90%]         │  │ [Barra naranja 85%]   │ ║
║  │                             │  │                       │ ║
║  │ ▼ Ver detalles              │  │ ▼ Ver detalles        │ ║
║  └─────────────────────────────┘  └─────────────────────────┘ ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║  Resumen de Errores Generales                                  ║
║                                                                ║
║  [4 Errores]  [36 Correctas]  [90% Desempeño General]         ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║  Recomendaciones                                               ║
║                                                                ║
║  🎉 ¡Excelente Desempeño!                                     ║
║                                                                ║
║  Has dominado el contenido. Considera ayudar a otros          ║
║  compañeros o explorar temas avanzados.                       ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║  [📝 Realizar Nuevo Intento]    [🚪 Cerrar Sesión]           ║
╚════════════════════════════════════════════════════════════════╝
```

### Si se expande el Módulo 1 (Viendo errores)

```
Módulo 1: Fundamentos - 95%
19/20 respuestas correctas

┌─ Preguntas que Necesitan Revisión ─┐
│                                     │
│ ❌ ¿Cuál es el modelo OSI?         │
│    [Protocolos de Red]             │
│                                     │
│ Tu respuesta: 8 capas               │
│ Respuesta correcta: 7 capas         │
│                                     │
│ Explicación:                        │
│ El modelo OSI tiene 7 capas:       │
│ 1. Física, 2. Enlace, ...          │
│                                     │
└─────────────────────────────────────┘
```

---

## 👨‍💼 Ejemplo de Panel de Administrador

### Dashboard

```
╔═══════════════════════════════════════════════════════════════════╗
║ Admin Panel                                                       ║
║ ──────────────────────────────────────────────────────────────── ║
║                                                                   ║
║  [📊]          [👥]           [⭐]          [✓]                 ║
║  325            47            78%            2,847               ║
║  Evaluaciones   Usuarios      Promedio       Aciertos Totales   ║
║  Totales        Activos       General                            ║
║                                                                   ║
╠═══════════════════════════════════════════════════════════════════╣
║  Evaluaciones Recientes                                           ║
║  ─────────────────────────────────────────────────────────────── ║
║                                                                   ║
║  Usuario        │ Email              │ Aciertos │ Calif. │ Fecha  ║
║  ────────────────────────────────────────────────────────────────║
║  Juan López     │ juan@example.com   │ 38/40   │ 95%   │ Hoy   ║
║  María García   │ maria@example.com  │ 32/40   │ 80%   │ Hoy   ║
║  Pedro Ruiz     │ pedro@example.com  │ 28/40   │ 70%   │ Ayer  ║
║  Ana Martínez   │ ana@example.com    │ 22/40   │ 55%   │ Ayer  ║
║  Carlos López   │ carlos@example.com │ 35/40   │ 87%   │ 2 días║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

### Evaluaciones (con búsqueda)

```
╔═══════════════════════════════════════════════════════════════════╗
║ Evaluaciones                                                      ║
║ ──────────────────────────────────────────────────────────────── ║
║                                                                   ║
║ [Buscar por usuario o email...]              47 resultados       ║
║                                                                   ║
╠═══════════════════════════════════════════════════════════════════╣
║ Usuario        │ Email        │ Aciertos │ Total │ Calif. │ Acciones
║ ────────────────────────────────────────────────────────────────║
║ ▶ Juan López   │ juan@ex.com  │ 38      │ 40   │ 95%   │ ▼     ║
║                                                                   ║
║   ID Evaluación: 507f1f77bcf86cd799439011                       ║
║   Respuestas Correctas: 38                                       ║
║   Respuestas Incorrectas: 2                                      ║
║   Tiempo Total: 2,847 segundos (47 minutos)                      ║
║   Fecha: 22/05/2026 14:30:15                                     ║
║                                                                   ║
║ ▶ María García │ maria@ex.com │ 32      │ 40   │ 80%   │ ▼     ║
║ ▶ Pedro Ruiz   │ pedro@ex.com │ 28      │ 40   │ 70%   │ ▼     ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

### Reportes

```
╔═══════════════════════════════════════════════════════════════════╗
║ Reportes                                                          ║
║ ──────────────────────────────────────────────────────────────── ║
║                                                                   ║
║  Distribución de Calificaciones                                  ║
║  ─────────────────────────────                                   ║
║                                                                   ║
║  ┌──────────────────────────┐  ┌─────────────────────────────┐  ║
║  │ Aprobados ≥80%:    28    │  │ Promedio General:      78%  │  ║
║  │ [barra verde]            │  │                             │  ║
║  │                          │  │ Máximo Porcentaje:    100%  │  ║
║  │ Parcial 60-79%:    15    │  │ Mínimo Porcentaje:     35%  │  ║
║  │ [barra naranja]          │  │                             │  ║
║  │                          │  │ Total de Evaluaciones: 325  │  ║
║  │ No Aprobado <60%:    4   │  │                             │  ║
║  │ [barra roja]             │  │                             │  ║
║  └──────────────────────────┘  └─────────────────────────────┘  ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## 🔄 Flujo de Datos

```
┌─────────────────┐
│ Estudiante      │
│ Inicia Examen   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Questions.jsx           │
│ - Carga preguntas       │
│ - Registra respuestas   │
│ - Finaliza examen       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Calcula Resultado       │
│ - Aciertos/Total        │
│ - Porcentaje            │
│ - Justificaciones       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Results.jsx             │
│ - Muestra círculo 90%   │
│ - Desempeño por módulo  │
│ - Errores detallados    │
│ - Recomendaciones       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Usuario puede:          │
│ - Reintentar           │
│ - Cerrar sesión        │
└─────────────────────────┘

PARALELO (Admin):
    └─────────────────────────────────┐
                                      │
                                      ▼
                          ┌──────────────────────┐
                          │ Datos guardados en   │
                          │ MongoDB              │
                          └──────────┬───────────┘
                                     │
                                     ▼
                          ┌──────────────────────┐
                          │ Admin Panel          │
                          │ - Dashboard          │
                          │ - Evaluaciones       │
                          │ - Reportes           │
                          └──────────────────────┘
```

---

## 📱 Ejemplo de Responsive (Mobile)

### Results en Mobile

```
┌────────────────────┐
│ Resultados...      │
│                    │
│ ┌────────────────┐ │
│ │     90%        │ │
│ │  (Círculo)     │ │
│ └────────────────┘ │
│                    │
│ ┌────────────────┐ │
│ │ Aprobado       │ │
│ │ 36 correctas   │ │
│ │ de 40          │ │
│ └────────────────┘ │
│                    │
│ ┌────────────────┐ │
│ │ Módulo 1: 95%  │ │
│ │ [Barra]        │ │
│ │ ▼ Ver errores  │ │
│ └────────────────┘ │
│                    │
│ ┌────────────────┐ │
│ │ Módulo 2: 90%  │ │
│ │ [Barra]        │ │
│ │ ▼ Ver errores  │ │
│ └────────────────┘ │
│                    │
│ [Reintentar]       │
│ [Cerrar Sesión]    │
└────────────────────┘
```

---

## ⚙️ Integración Backend Requerida

El backend debe continuar proporcionando:

1. **GET `/preguntas/random`**
   - Retorna bloques con preguntas

2. **POST `/resultados/evaluacion`**
   - Guarda: userId, bloques, respuestas, resultadoFinal

3. **GET `/admin/evaluaciones`** (requiere token + rol admin)
   - Retorna array de evaluaciones

Estructura esperada en evaluaciones:

```javascript
{
  _id: ObjectId,
  userId: String,
  username: String,
  email: String,
  resultadoFinal: {
    total: Number,
    aciertos: Number,
    porcentaje: Number
  },
  fecha: Date
}
```
