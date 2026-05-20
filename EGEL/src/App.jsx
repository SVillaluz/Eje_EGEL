import { useEffect, useState } from "react";
import "./App.css";
import NewUser from "./newUser";
import Menu from "./Menu";
import Questions from "./questions";

function App() {
  const [showNewUser, setShowNewUser] = useState(false);
  const [logged, setLogged] = useState(Boolean(localStorage.getItem("token")));
  const [showMenu, setShowMenu] = useState(
    Boolean(localStorage.getItem("token")),
  );
  const [simState, setSimState] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const API_URL = "http://localhost:5000/api";

  const login = async () => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user.id);
        setEmail("");
        setPassword("");
        setLogged(true);
        setShowMenu(true);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Error al iniciar sesión");
    }
  };

  const handleStartSimulator = (options) => {
    setSimState(options || null);
    setShowMenu(false);
  };

  const handleReturnToMenu = () => {
    setSimState(null);
    setShowMenu(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");

    setEmail("");
    setPassword("");

    setLogged(false);
    setShowMenu(false);
    setSimState(null);
  };

  if (showNewUser) {
    return <NewUser onBack={() => setShowNewUser(false)} />;
  }

  if (!logged) {
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

  if (showMenu) {
    return <Menu onStart={handleStartSimulator} onLogout={handleLogout} />;
  }

  return <Questions {...simState} onExit={handleReturnToMenu} />;
}

export default App;
