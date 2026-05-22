# 🚀 Instrucciones para Probar los Cambios

## ✅ Pre-requisitos

- Node.js instalado
- MongoDB corriendo
- Las dependencias instaladas (`npm install` en raíz y en `/EGEL`)

---

## 🎯 Pasos para Probar

### 1. Iniciar el Servidor Backend
```bash
# En la raíz del proyecto
npm run dev
# o
npm run dev-auth  # Si está usando autenticación
```

El servidor debe correr en `http://localhost:5000`

### 2. Iniciar el Cliente React/Vite
```bash
# En otra terminal
cd EGEL
npm run dev
```

El cliente debe abrir en `http://localhost:5173` (o similar)

---

## 🧪 Pruebas del Componente de Resultados

### Escenario 1: Examen Completo (90% - Aprobado)

1. Inicia sesión con un usuario
2. Haz clic en "Iniciar examen"
3. Responde todas las preguntas (intenta acertar la mayoría)
4. Termina los bloques hasta llegar a resultados
5. Deberías ver:
   - ✅ Círculo azul con 90%
   - ✅ Estado "Aprobado" en verde
   - ✅ Cards de módulos con porcentajes
   - ✅ Recomendación tipo "¡Excelente Desempeño!"

### Escenario 2: Desempeño Parcial (70% - Parcial)

1. Responde bien ~70% de las preguntas
2. Termina el examen
3. Deberías ver:
   - ✅ Círculo naranja con 70%
   - ✅ Estado "Parcial" en naranja
   - ✅ Recomendación tipo "Buen Progreso"

### Escenario 3: Bajo Desempeño (50% - No Aprobado)

1. Responde solo ~50% correctamente
2. Termina el examen
3. Deberías ver:
   - ✅ Círculo rojo con 50%
   - ✅ Estado "No Aprobado" en rojo
   - ✅ Recomendación tipo "Necesitas Refuerzo"

---

## 👨‍💼 Pruebas del Panel Administrador

### Preparación
1. Crea varios usuarios de prueba
2. Que cada uno responda el examen con diferentes porcentajes
3. Esto generará datos para mostrar en el admin

### Prueba: Acceder al Panel

1. Inicia sesión con usuario **admin** (rol="admin")
2. Verás botón "Panel administrador"
3. Haz clic en él
4. Deberías ver:
   - ✅ Sidebar azul con navegación
   - ✅ Dashboard con 4 cards de estadísticas
   - ✅ Tabla de últimas evaluaciones

### Prueba: Dashboard

- [ ] Verifica que muestre:
  - [ ] Total de evaluaciones
  - [ ] Número de usuarios únicos
  - [ ] Promedio de porcentaje
  - [ ] Total de aciertos

### Prueba: Evaluaciones

1. Haz clic en "📋 Evaluaciones"
2. Deberías ver tabla completa de todas las evaluaciones
3. Prueba buscar:
   - [ ] Escribe un nombre de usuario → debe filtrar
   - [ ] Escribe un email → debe filtrar
   - [ ] Vacía el search → debe mostrar todas

### Prueba: Expandir Fila

1. Haz clic en una fila de evaluación
2. Se debe expandir mostrando:
   - [ ] ID de evaluación
   - [ ] ID del usuario
   - [ ] Respuestas correctas e incorrectas
   - [ ] Tiempo total
   - [ ] Fecha exacta

### Prueba: Reportes

1. Haz clic en "📈 Reportes"
2. Deberías ver:
   - [ ] Cantidad de aprobados (color verde)
   - [ ] Cantidad de parciales (color naranja)
   - [ ] Cantidad de no aprobados (color rojo)
   - [ ] Promedio, máximo, mínimo

---

## 🎨 Verificar Estilos

### Colors Empresariales

- [ ] Sidebar tiene gradiente azul (#00365d → #004e92)
- [ ] Botón activo en nav brilla en azul celeste
- [ ] Cards tienen bordes azules
- [ ] Errores muestran en rojo (#ff6b6b)
- [ ] Aprobados en verde (#00cc88)
- [ ] Parciales en naranja (#ffb84d)

### Diseño Responsivo

Prueba en diferentes tamaños:

**Desktop (>1024px):**
- [ ] Sidebar a la izquierda
- [ ] Grid de 4 columnas para stats
- [ ] Tabla con scroll horizontal completa

**Tablet (768px-1024px):**
- [ ] Sidebar se convierte en menú horizontal superior
- [ ] Grid de 2 columnas
- [ ] Tabla todavía visible

**Mobile (<768px):**
- [ ] Menú horizontal superior colapsable
- [ ] Grid de 1 columna
- [ ] Tabla scrollable horizontalmente

---

## 🐛 Debugging

### Si no ves los estilos:

1. Verifica que los archivos CSS estén en:
   - `src/results.css`
   - `src/admin.css`

2. Limpia el caché:
   ```bash
   # Ctrl+Shift+R en el navegador (limpieza dura)
   # o
   npm run dev  # Reinicia el servidor dev
   ```

### Si el componente Results no aparece:

1. Verifica que `Questions.jsx` importe `Results`:
   ```javascript
   import Results from "./Results";
   ```

2. Verifica que `results.css` esté en la misma carpeta que `Results.jsx`

3. Abre la consola del navegador (F12) y busca errores

### Si el Admin Panel no funciona:

1. Verifica que el usuario tenga `role: "admin"` en la BD
2. Verifica que `admin.jsx` importe `admin.css`
3. Verifica la conexión con `/admin/evaluaciones` en Network (F12 → Network)

---

## 📊 Datos de Prueba para MongoDB

Si necesitas datos de prueba, ejecuta:

```javascript
// En mongosh conectado a tu BD
db.users.insertOne({
  username: "admin",
  email: "admin@test.com",
  password: "hashedpassword",
  role: "admin"
})

db.evaluaciones.insertMany([
  {
    userId: "userId1",
    username: "Juan López",
    email: "juan@test.com",
    resultadoFinal: { aciertos: 38, total: 40, porcentaje: 95 },
    tiempoTotal: 2847,
    fecha: new Date()
  },
  {
    userId: "userId2",
    username: "María García",
    email: "maria@test.com",
    resultadoFinal: { aciertos: 28, total: 40, porcentaje: 70 },
    tiempoTotal: 3200,
    fecha: new Date()
  }
])
```

---

## 🔍 Verificar Datos en Console

En el navegador, abre la consola (F12) y prueba:

```javascript
// Ver datos de resultado
console.log(resultado); // { aciertos: 36, total: 40, porcentaje: 90 }

// Ver justificaciones
console.log(justificaciones); // Array de errores

// Ver bloques
console.log(bloques); // Array de módulos
```

---

## ✨ Checklist Final

- [ ] Results.jsx se muestra al finalizar examen
- [ ] Círculo de porcentaje es visible y animado
- [ ] Estados (Aprobado/Parcial/No Aprobado) muestran colores correctos
- [ ] Cards de módulos son expandibles
- [ ] Errores muestran pregunta, tu respuesta y respuesta correcta
- [ ] Panel Admin carga si eres admin
- [ ] Dashboard muestra estadísticas correctas
- [ ] Búsqueda en evaluaciones funciona
- [ ] Filas se expanden al hacer clic
- [ ] Reportes muestran distribución correcta
- [ ] Responsive funciona en mobile
- [ ] Colores azules empresariales se ven en todo
- [ ] Botones funcionan (Reintentar, Cerrar Sesión, etc.)

---

## 🆘 Soporte

Si algo no funciona:

1. Revisa la consola del navegador (F12 → Console)
2. Revisa los logs del servidor backend
3. Verifica que los archivos estén en la carpeta correcta:
   - `src/Results.jsx`
   - `src/results.css`
   - `src/admin.jsx`
   - `src/admin.css`
   - `src/questions.jsx` (actualizado)

4. Si necesitas ver los cambios:
   ```bash
   # Terminal en EGEL/
   npm run dev
   
   # Y en otra terminal en raíz
   npm run dev
   ```

---

## 📝 Notas

- El cálculo de calificación es: `(Aciertos / Total) * 100`
- Por módulo es: `(Aciertos del módulo / Total del módulo) * 100`
- La recomendación cambia según el porcentaje final
- Los estilos son totalmente responsive
- El Admin Panel requiere autenticación con rol "admin"
