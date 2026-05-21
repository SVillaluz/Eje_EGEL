import { useState } from "react";
import validator from "validator";
import "./App.css";

function NewUser({ onBack }) {
  const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");

  const register = async () => {
    if (pass1 !== pass2) {
      alert("Las contraseñas no coinciden");
      return;
    }

    const isValid = validator.isStrongPassword(pass1, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    });

    if (!isValid) {
      alert(
        "La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un símbolo"
      );
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
        placeholder="Escribe tu nombre completo..."
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
