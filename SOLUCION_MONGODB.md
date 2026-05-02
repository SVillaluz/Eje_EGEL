# 🔧 Guía para resolver error de autenticación MongoDB Atlas

## ❌ Error actual: "bad auth : authentication failed"

Esto significa que las credenciales no son correctas. Vamos a solucionarlo paso a paso:

## 📋 Pasos para configurar MongoDB Atlas correctamente

### 1️⃣ **Crear un nuevo usuario de base de datos**

1. Ve a [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Inicia sesión con tu cuenta
3. Haz clic en tu cluster (Cluster0)
4. En el menú izquierdo, haz clic en **"Database Access"**
5. Haz clic en **"Add New Database User"**
6. **Authentication Method**: "Password"
7. **Username**: `egel_user` (o cualquier nombre simple)
8. **Password**: Haz clic en **"Autogenerate Secure Password"**
9. **Database User Privileges**: "Read and write any database"
10. Haz clic en **"Add User"**

### 2️⃣ **Permitir acceso desde tu IP**

1. En el menú izquierdo, haz clic en **"Network Access"**
2. Haz clic en **"Add IP Address"**
3. Selecciona **"Add Current IP Address"** (tu IP actual)
4. Haz clic en **"Confirm"**

### 3️⃣ **Obtener la connection string correcta**

1. En el menú izquierdo, haz clic en **"Clusters"**
2. Haz clic en **"Connect"** (botón azul)
3. Selecciona **"Drivers"**
4. En el dropdown, selecciona **"Node.js"**
5. **Copia la connection string completa**

Debería verse así:
```
mongodb+srv://egel_user:tu_contraseña_generada@cluster0.vgpgbsa.mongodb.net/?retryWrites=true&w=majority
```

### 4️⃣ **Actualizar tu archivo `.env`**

Reemplaza la línea `MONGODB_URI=` con la connection string que copiaste.

**IMPORTANTE**: Si tu contraseña tiene caracteres especiales, deben estar URL-encoded:
- `@` → `%40`
- `+` → `%2B`
- `.` → `%2E`
- `$` → `%24`
- etc.

### 5️⃣ **Probar la conexión**

```bash
npm run dev
```

Deberías ver:
```
✅ Conectado a MongoDB Atlas
🚀 Servidor ejecutándose en http://localhost:5000
```

---

## 🔍 Si aún tienes problemas

### **Error: "bad auth : authentication failed"**
- ✅ Verifica que el usuario existe en "Database Access"
- ✅ Verifica que la contraseña es correcta (cópiala de nuevo)
- ✅ Verifica que tu IP está en "Network Access"

### **Error: "querySrv ENOTFOUND"**
- ✅ Verifica que la URI tiene el formato correcto
- ✅ Verifica que el cluster ID (`vgpgbsa`) es correcto

### **Error: "connection timed out"**
- ✅ Verifica que tu IP está permitida en "Network Access"
- ✅ Intenta permitir todas las IPs temporalmente: `0.0.0.0/0`

---

## 📞 ¿Necesitas ayuda?

Si sigues teniendo problemas, comparte:
- Tu connection string (sin la contraseña)
- El nombre del usuario que creaste
- Una captura de pantalla de "Database Access" y "Network Access"

¡Vamos a resolver esto juntos! 🚀
