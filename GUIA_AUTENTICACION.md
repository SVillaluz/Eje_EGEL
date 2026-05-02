# 🔐 Sistema de Autenticación Multi-Usuario con MongoDB

## 📋 ¿Qué incluye este sistema?

✅ **Registro de usuarios** con email y contraseña
✅ **Login/logout** con JWT tokens
✅ **Datos aislados por usuario** (cada usuario ve solo sus datos)
✅ **Roles de usuario** (user/admin)
✅ **Protección de rutas** con middleware JWT
✅ **Hash seguro de contraseñas** con bcrypt

## 🚀 Cómo usar

### 1️⃣ **Instalar dependencias**
```bash
npm install bcrypt jsonwebtoken
```

### 2️⃣ **Configurar variables de entorno**
Agrega a tu `.env`:
```bash
JWT_SECRET=tu_secreto_jwt_muy_seguro_aqui
```

### 3️⃣ **Ejecutar el servidor con autenticación**
```bash
npm run dev-auth
```

### 4️⃣ **Usar el frontend con autenticación**
Cambia en `EGEL/src/main.jsx`:
```javascript
// De:
import App from './App.jsx'

// A:
import App from './App-auth.jsx'
```

## 📡 APIs Disponibles

### 🔓 **Públicas (sin autenticación)**
- `GET /api/health` - Verificar servidor
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### 🔒 **Protegidas (requieren token JWT)**
- `GET /api/user/profile` - Perfil del usuario actual
- `GET /api/user/data` - Datos del usuario actual
- `POST /api/user/data` - Agregar dato al usuario
- `GET /api/admin/users` - Lista de usuarios (solo admin)

## 🗄️ Estructura de Base de Datos

### Colección `users`
```javascript
{
  _id: ObjectId,
  username: "usuario123",
  email: "usuario@email.com",
  password: "$2b$10$...", // Hash bcrypt
  role: "user", // "user" o "admin"
  createdAt: Date
}
```

### Colección `user_data`
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Referencia al usuario
  nombre: "Dato del usuario",
  fecha: Date,
  createdAt: Date
}
```

## 🔑 Cómo funciona la autenticación

### 1️⃣ **Registro**
```javascript
POST /api/auth/register
{
  "username": "miusuario",
  "email": "usuario@email.com",
  "password": "micontraseña"
}
```

### 2️⃣ **Login**
```javascript
POST /api/auth/login
{
  "username": "miusuario",
  "password": "micontraseña"
}

// Respuesta:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "username": "miusuario",
    "role": "user"
  }
}
```

### 3️⃣ **Usar APIs protegidas**
```javascript
// Incluir token en headers
GET /api/user/data
Headers: {
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
}
```

## 🎯 Ejemplo de uso completo

### **Crear usuario admin manualmente**
```javascript
// En MongoDB Compass o shell:
db.users.insertOne({
  username: "admin",
  email: "admin@egel.com",
  password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // "admin123"
  role: "admin",
  createdAt: new Date()
})
```

### **Frontend con autenticación**
- Los usuarios deben registrarse/login primero
- Cada usuario ve solo sus propios datos
- Los datos se guardan con `userId` para aislamiento

## 🛡️ Seguridad implementada

✅ **Hash de contraseñas** con bcrypt (salt rounds: 10)
✅ **JWT tokens** con expiración (24 horas)
✅ **Middleware de autenticación** en rutas protegidas
✅ **Aislamiento de datos** por usuario
✅ **Validación de roles** para acceso admin

## 🔧 Personalización

### **Cambiar tiempo de expiración del token**
```javascript
// En server-auth.js
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }); // 7 días
```

### **Agregar más roles**
```javascript
// Roles posibles: "user", "admin", "moderator"
const newUser = {
  // ... otros campos
  role: "moderator"
};
```

### **Campos adicionales en perfil**
```javascript
const newUser = {
  username,
  email,
  password: hashedPassword,
  firstName: req.body.firstName, // Nuevo campo
  lastName: req.body.lastName,   // Nuevo campo
  role: 'user',
  createdAt: new Date()
};
```

## 🚨 Consideraciones de seguridad

⚠️ **Importante:**
- Nunca subas el `.env` a Git (ya está en `.gitignore`)
- Usa un `JWT_SECRET` fuerte y único
- En producción, usa HTTPS
- Considera implementar refresh tokens
- Agrega rate limiting para login/register

## 🎮 Prueba el sistema

1. **Regístrate** con usuario/email/contraseña
2. **Inicia sesión** con tus credenciales
3. **Agrega datos** - solo tú los verás
4. **Crea otro usuario** - sus datos estarán separados
5. **Cierra sesión** y prueba con diferentes usuarios

¡Ya tienes un sistema completo de autenticación multi-usuario! 🎉