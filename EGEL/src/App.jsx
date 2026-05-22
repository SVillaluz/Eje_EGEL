import { useState } from "react";
import "./App.css";
import NewUser from "./newUser";
import Questions from "./questions";
import AdminPanel from "./admin";

function App() {
  const [showNewUser, setShowNewUser] = useState(false);

  const [logged, setLogged] = useState(false);

  const [user, setUser] = useState(null);

  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const [startExam, setStartExam] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

  const login = async () => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);

        localStorage.setItem("userId", data.user.id);

        localStorage.setItem("user", JSON.stringify(data.user));

        setUser(data.user);

        setLogged(true);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);

      alert("Error al iniciar sesión");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    localStorage.removeItem("userId");

    setLogged(false);

    setUser(null);

    setShowAdminPanel(false);

    setStartExam(false);

    setEmail("");

    setPassword("");
  };

  // REGISTRO
  if (showNewUser) {
    return <NewUser onBack={() => setShowNewUser(false)} />;
  }

  // ADMIN PANEL
  if (logged && showAdminPanel) {
    return <AdminPanel onBack={() => setShowAdminPanel(false)} />;
  }

  // EXAMEN
  if (logged && startExam) {
    return <Questions />;
  }

  // MENÚ DESPUÉS DEL LOGIN
  if (logged) {
    return (
      <div className="center">
        <h1>Bienvenido {user?.username}</h1>

        <p>Selecciona una opción</p>

        <div className="actions">
          {user?.role !== "admin" && (
            <button className="btn" onClick={() => setStartExam(true)}>
              Iniciar examen
            </button>
          )}

          {user?.role === "admin" && (
            <button className="btn" onClick={() => setShowAdminPanel(true)}>
              Panel administrador
            </button>
          )}

          <button className="btn" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  // LOGIN
  return (
    <div className="center">
      <h1>Inicio de sesión</h1>

      <label>Correo</label>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Escribe tu correo..."
      />

      <label>Contraseña</label>

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Escribe tu contraseña..."
      />

      <div className="actions">
        <button className="btn" onClick={login}>
          Iniciar sesión
        </button>
      </div>

      <p className="link-text" onClick={() => setShowNewUser(true)}>
        Registrarse
      </p>
    </div>
  );
}

export default App;
