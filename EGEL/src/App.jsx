import { useState } from "react";
import "./App.css";
import NewUser from "./newUser";
import Questions from "./questions";

function App() {
  const [showNewUser, setShowNewUser] = useState(false);
  const [logged, setLogged] = useState(false);

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
        setLogged(true);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Error al iniciar sesión");
    }
  };

  if (showNewUser) {
    return <NewUser onBack={() => setShowNewUser(false)} />;
  }

  if (logged) {
    return <Questions />;
  }

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
