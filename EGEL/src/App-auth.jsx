import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [userData, setUserData] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [estado, setEstado] = useState("Verificando sesión...");

  // Estados de autenticación
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  // Estados de login/register
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

  // Headers con token para requests autenticados
  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  });

  // Verificar token al cargar la app
  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setEstado("No has iniciado sesión");
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsLoggedIn(true);
        setEstado(`Conectado como ${data.user.username}`);
        obtenerDatosUsuario();
      } else {
        localStorage.removeItem("token");
        setToken("");
        setEstado("Sesión expirada");
      }
    } catch (error) {
      setEstado("Error de conexión");
    }
  };

  // Obtener datos del usuario actual
  const obtenerDatosUsuario = async () => {
    try {
      const response = await fetch(`${API_URL}/user/data`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Agregar dato del usuario
  const agregarDatoUsuario = async () => {
    if (!inputValue.trim()) return;

    try {
      const response = await fetch(`${API_URL}/user/data`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ nombre: inputValue, fecha: new Date() }),
      });
      const data = await response.json();
      setUserData([...userData, data]);
      setInputValue("");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        setIsLoggedIn(true);
        localStorage.setItem("token", data.token);
        setEstado(`Bienvenido ${data.user.username}!`);
        obtenerDatosUsuario();
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  // Register
  const handleRegister = async (e) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: registerData.username,
          email: registerData.email,
          password: registerData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        setIsLoggedIn(true);
        localStorage.setItem("token", data.token);
        setEstado(`Cuenta creada! Bienvenido ${data.user.username}`);
        obtenerDatosUsuario();
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setIsLoggedIn(false);
    setUserData([]);
    setEstado("Sesión cerrada");
  };

  if (!isLoggedIn) {
    return (
      <div className="auth-container">
        <h1>EGEL - Autenticación</h1>

        <div className="tab-row">
          <button
            onClick={() => setIsLoginMode(true)}
            className={`tab-btn ${isLoginMode ? "active" : ""}`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setIsLoginMode(false)}
            className={`tab-btn ${!isLoginMode ? "active" : ""}`}
          >
            Registrarse
          </button>
        </div>

        {isLoginMode ? (
          <form onSubmit={handleLogin}>
            <h2>Iniciar Sesión</h2>
            <input
              type="text"
              placeholder="Usuario"
              value={loginData.username}
              onChange={(e) =>
                setLoginData({ ...loginData, username: e.target.value })
              }
              className="input"
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
              className="input"
              required
            />
            <div className="actions-row">
              <button type="submit" className="btn">
                Iniciar Sesión
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <h2>Crear Cuenta</h2>
            <input
              type="text"
              placeholder="Usuario"
              value={registerData.username}
              onChange={(e) =>
                setRegisterData({ ...registerData, username: e.target.value })
              }
              className="input"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={registerData.email}
              onChange={(e) =>
                setRegisterData({ ...registerData, email: e.target.value })
              }
              className="input"
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={registerData.password}
              onChange={(e) =>
                setRegisterData({ ...registerData, password: e.target.value })
              }
              className="input"
              required
            />
            <input
              type="password"
              placeholder="Confirmar Contraseña"
              value={registerData.confirmPassword}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  confirmPassword: e.target.value,
                })
              }
              className="input"
              required
            />
            <div className="actions-row">
              <button type="submit" className="btn">
                Crear Cuenta
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>

        <div>
          <h1>EGEL - Multi Usuario</h1>
          <p>
            Usuario: <strong>{user?.username}</strong> ({user?.role})
          </p>
          <p>Estado: {estado}</p>
          <button onClick={handleLogout} className="btn btn--danger btn--sm">
            Cerrar Sesión
          </button>
        </div>

        {/* Contador */}
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>

        {/* Agregar dato del usuario */}
        <div className="actions-row">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && agregarDatoUsuario()}
            placeholder="Escribe un nombre..."
            className="input"
          />
          <button onClick={agregarDatoUsuario} className="btn btn--sm">
            Agregar
          </button>
          <button onClick={obtenerDatosUsuario} className="btn btn--sm">
            Obtener mis datos
          </button>
        </div>

        {/* Mostrar datos del usuario */}
        <div className="section section--left">
          <h3>Mis datos en MongoDB:</h3>
          {userData.length === 0 ? (
            <p>No tienes datos guardados</p>
          ) : (
            <ul>
              {userData.map((item, index) => (
                <li key={item._id || index}>
                  {item.nombre} -{" "}
                  {new Date(item.fecha || item.createdAt).toLocaleString()}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

export default App;
