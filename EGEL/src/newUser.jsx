import { useState } from "react";
import "./App.css";

function NewUser({ onBack }) {
  const API_URL = "http://localhost:5000/api";

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");

  const register = async () => {
    if (pass1 !== pass2) {
      alert("Las contraseñas no coinciden");
      return;
    }

    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password: pass1,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Usuario creado");
      onBack();
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="center">
      <h1>Registro</h1>

      <label>Username</label>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Escribe tu nombre de usuario..."
      />

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
        value={pass1}
        onChange={(e) => setPass1(e.target.value)}
        placeholder="Escribe tu contraseña..."
      />

      <label>Confirmar contraseña</label>
      <input
        type="password"
        value={pass2}
        onChange={(e) => setPass2(e.target.value)}
        placeholder="Confirma tu contraseña..."
      />

      <div className="actions">
        <button className="btn" onClick={register}>
          Registrarse
        </button>
      </div>

      <p className="link-text" onClick={onBack}>
        Volver
      </p>
    </div>
  );
}

export default NewUser;
