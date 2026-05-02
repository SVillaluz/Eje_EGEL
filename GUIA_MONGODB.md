# 🚀 Configuración MongoDB + React + Express

## 📋 Pasos para conectar todo

### 1️⃣ **Configurar MongoDB Atlas**

1. Ve a [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta gratuita (si no tienes)
3. Crea un cluster (opción gratuita)
4. En "Database Access", crea un usuario con contraseña
5. En "Network Access", agrega tu IP (o permite todas las IPs: 0.0.0.0/0)
6. Haz clic en "Connect" → "Drivers" → copia la **connection string**

### 2️⃣ **Configurar tu archivo `.env`**

Abre el archivo `.env` en la raíz del proyecto:
```bash
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/?retryWrites=true&w=majority
PORT=5000
```

Reemplaza `usuario`, `contraseña` y `cluster` con tus datos de MongoDB Atlas.

### 3️⃣ **Instalar dependencias**

```bash
# En la raíz del proyecto (para el servidor)
npm install

# En la carpeta EGEL (para el frontend)
cd EGEL
npm install
cd ..
```

### 4️⃣ **Ejecutar la aplicación**

**Terminal 1 - Servidor Express + MongoDB:**
```bash
npm run dev
```

**Terminal 2 - Frontend React (nueva terminal):**
```bash
npm run client
```

El servidor estará en `http://localhost:5000`
El frontend estará en `http://localhost:5173`

### 5️⃣ **Probar la conexión**

1. Abre `http://localhost:5173` en tu navegador
2. Deberías ver "✅ Servidor funcionando" 
3. Escribe un nombre y haz clic en "Agregar"
4. Haz clic en "Obtener datos" para ver los datos guardados en MongoDB

---

## 📁 Estructura de carpetas

```
Eje_EGEL/
├── server.js          ← Servidor Express con MongoDB
├── .env               ← Variables de entorno (IMPORTANTE: no subir a GitHub)
├── package.json       ← Dependencias del servidor
├── EGEL/              ← Tu aplicación React
│   ├── src/
│   │   └── App.jsx    ← Actualizado con conexión a API
│   └── package.json
└── README.md
```

---

## 🔧 Cambios realizados

✅ Creado **server.js** - Servidor Express con rutas API
✅ Creado **.env** - Configuración de MongoDB
✅ Actualizado **package.json** - Agregadas dependencias (express, mongodb, cors, dotenv)
✅ Actualizado **App.jsx** - Interface para agregar y obtener datos

---

## 🐛 Si algo no funciona

**Error: "No se pudo conectar al servidor"**
- ✅ Verifica que el servidor está corriendo en Terminal 1
- ✅ Verifica que el `.env` tiene la URI correcta

**Error: "MongoAuthenticationError"**
- ✅ Verifica usuario y contraseña en MongoDB Atlas
- ✅ Verifica que la IP está agregada en "Network Access"

**Error: "404 Not Found"**
- ✅ Asegúrate que ambas terminales están ejecutando

---

## 📚 Próximos pasos

- Agregar más endpoints en `server.js`
- Agregar validación de datos
- Implementar autenticación (JWT)
- Agregar más colecciones en MongoDB

¡Éxito! 🎉
