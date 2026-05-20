import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api";

function Menu({ onStart, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("No se encontró el usuario. Inicia sesión de nuevo.");
      setLoading(false);
      return;
    }

    const cargarProgreso = async () => {
      try {
        const res = await fetch(`${API_URL}/progreso/${userId}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Error al obtener el progreso");
        }
        setProgress(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    cargarProgreso();
  }, []);

  const handleStart = () => {
    if (!progress || !progress.hasProgress) {
      onStart({ initialBloque: 0, initialAciertos: 0, initialIntento: 1 });
      return;
    }

    const startBlock = Math.max(progress.resumeBlockNumber - 1, 0);
    onStart({
      initialBloque: startBlock,
      initialAciertos: progress.totalCorrectAfterRound,
      initialIntento: progress.resumeAttempt,
    });
  };

  const handleRetry = () => {
    onStart({ initialBloque: 0, initialAciertos: 0, initialIntento: 1 });
  };

  return (
    <div className="center">
      <h1>Menú Principal</h1>

      {loading ? (
        <p>Cargando progreso...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          {progress && progress.hasProgress ? (
            <div className="result-box">
              {progress.completed ? (
                <>
                  <h2>¡Felicidades!</h2>
                  <p>Has completado las 60 preguntas correctas.</p>
                  <p>Progreso guardado: {progress.totalCorrectAfterRound} / 60</p>
                </>
              ) : (
                <>
                  <p>Progreso actual: {progress.totalCorrectAfterRound} / 60</p>
                  <p>Bloque guardado: {progress.resumeBlockNumber}</p>
                  <p>Intento siguiente: {progress.resumeAttempt}</p>
                  <p>
                    {progress.lastRoundInfo
                      ? `Último bloque: ${progress.lastRoundInfo.roundNumber}, ` +
                        `${progress.lastRoundInfo.allCorrect ? "completado" : "sin completar"}`
                      : "Continuar donde quedaste."}
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="result-box">
              <h2>Bienvenido</h2>
              <p>No hay progreso guardado aún.</p>
              <p>Comienza el simulador y cumple las 60 preguntas correctas.</p>
            </div>
          )}

          <div className="actions" style={{ marginTop: 16 }}>
            {progress && progress.hasProgress && progress.completed ? (
              <button className="btn" onClick={handleRetry}>
                Volver a intentarlo
              </button>
            ) : (
              <button className="btn" onClick={handleStart}>
                {progress && progress.hasProgress ? "Continuar simulador" : "Comenzar simulador"}
              </button>
            )}
          </div>
        </>
      )}

      <div className="actions" style={{ marginTop: 20 }}>
        <button className="btn btn-secondary" onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default Menu;
