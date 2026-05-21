import { useEffect, useState } from "react";
import "./questions.css";

function App() {
  const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

  const [bloques, setBloques] = useState([]);
  const [bloqueActual, setBloqueActual] = useState(0);

  const [mostrarRetroBloque, setMostrarRetroBloque] = useState(false);

  const [preguntas, setPreguntas] = useState([]);

  const [indiceActual, setIndiceActual] = useState(0);

  const [respuestas, setRespuestas] = useState({});

  // TODAS LAS JUSTIFICACIONES
  const [justificaciones, setJustificaciones] = useState([]);

  // SOLO JUSTIFICACIONES DEL BLOQUE ACTUAL
  const [justificacionesBloque, setJustificacionesBloque] = useState([]);

  const [feedback, setFeedback] = useState("");

  const [cargando, setCargando] = useState(true);

  const [finalizado, setFinalizado] = useState(false);

  const [resultado, setResultado] = useState(null);

  const [tiempo, setTiempo] = useState(60);

  const [tiempoTotal, setTiempoTotal] = useState(0);

  useEffect(() => {
    cargarPreguntas();
  }, []);

  const cargarPreguntas = async () => {
    try {
      setCargando(true);

      const res = await fetch(`${API_URL}/preguntas/random`);

      const data = await res.json();

      console.log("Preguntas recibidas:", data);

      if (Array.isArray(data.bloques)) {
        setBloques(data.bloques);

        setPreguntas(data.bloques[0].preguntas);

        setBloqueActual(0);
      } else {
        console.error("Formato inválido");

        setPreguntas([]);
      }
    } catch (error) {
      console.error("Error cargando preguntas:", error);

      setPreguntas([]);
    } finally {
      setCargando(false);
    }
  };

  const preguntaActual = preguntas[indiceActual];

  useEffect(() => {
    setFeedback("");
  }, [indiceActual]);

  // CRONÓMETRO
  useEffect(() => {
    if (finalizado || cargando || mostrarRetroBloque || !preguntas.length) {
      return;
    }

    if (tiempo <= 0) {
      if (indiceActual < preguntas.length - 1) {
        setIndiceActual((prev) => prev + 1);

        setTiempo(60);
      } else {
        setMostrarRetroBloque(true);
      }

      return;
    }

    const timer = setTimeout(() => {
      setTiempo((prev) => prev - 1);

      setTiempoTotal((prev) => prev + 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [tiempo, finalizado, cargando, indiceActual, mostrarRetroBloque]);

  const responder = (opcion, index) => {
    const correctaIndex = Number.isNaN(Number(preguntaActual.correcta))
      ? preguntaActual.opciones.findIndex(
          (item) => item === preguntaActual.correcta,
        )
      : Number(preguntaActual.correcta);

    const esCorrecta = index === correctaIndex;

    const justificacionTexto = !esCorrecta
      ? preguntaActual.justificacion ||
        preguntaActual.explicacion ||
        "Respuesta incorrecta. Revisa la explicación."
      : "";

    setRespuestas((prev) => ({
      ...prev,
      [preguntaActual._id]: {
        opcion,
        index,
        correcta: esCorrecta,
      },
    }));

    if (!esCorrecta) {
      // JUSTIFICACIONES DEL BLOQUE
      setJustificacionesBloque((prev) => {
        if (prev.some((j) => j.id === preguntaActual._id)) {
          return prev;
        }

        return [
          ...prev,
          {
            id: preguntaActual._id,
            subarea: preguntaActual.subarea,
            justificacion: justificacionTexto,
          },
        ];
      });

      // JUSTIFICACIONES GENERALES
      setJustificaciones((prev) => {
        if (prev.some((j) => j.id === preguntaActual._id)) {
          return prev;
        }

        return [
          ...prev,
          {
            id: preguntaActual._id,
            subarea: preguntaActual.subarea,
            justificacion: justificacionTexto,
          },
        ];
      });
    }
  };

  const siguiente = () => {
    if (!respuestas[preguntaActual._id]) {
      alert(
        "Seleccione una opción para poder continuar con el resto de preguntas",
      );

      return;
    }

    // SIGUIENTE PREGUNTA DEL BLOQUE
    if (indiceActual < preguntas.length - 1) {
      setIndiceActual((prev) => prev + 1);

      setTiempo(60);

      return;
    }

    // TERMINAR BLOQUE
    setMostrarRetroBloque(true);
  };

  const siguienteBloque = () => {
    // ÚLTIMO BLOQUE
    if (bloqueActual >= bloques.length - 1) {
      terminarExamen();

      return;
    }

    const nuevoBloque = bloqueActual + 1;

    setBloqueActual(nuevoBloque);

    setPreguntas(bloques[nuevoBloque].preguntas);

    setIndiceActual(0);

    setTiempo(60);

    // LIMPIAR JUSTIFICACIONES DEL BLOQUE
    setJustificacionesBloque([]);

    setMostrarRetroBloque(false);
  };

  const terminarExamen = async () => {
    let aciertos = 0;

    Object.values(respuestas).forEach((r) => {
      if (r.correcta) {
        aciertos++;
      }
    });

    const totalPreguntas = bloques.length * 10;

    const resultadoFinal = {
      total: totalPreguntas,
      aciertos,
      porcentaje: ((aciertos / totalPreguntas) * 100).toFixed(0),
    };

    // GUARDAR RESULTADO EN ESTADO
    setResultado(resultadoFinal);

    // OCULTAR RETRO DEL BLOQUE
    setMostrarRetroBloque(false);

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      console.log("Usuario:", user);

      const response = await fetch(`${API_URL}/resultados/evaluacion`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          userId: user?.id,
          bloques,
          respuestas,
          resultadoFinal,
          tiempoTotal,
        }),
      });

      const data = await response.json();

      console.log("Evaluación guardada:", data);
    } catch (error) {
      console.error("Error guardando evaluación:", error);
    }

    // MOSTRAR RESULTADO FINAL
    setFinalizado(true);
  };

  const reiniciarExamen = () => {
    setIndiceActual(0);

    setRespuestas({});

    setJustificaciones([]);

    setJustificacionesBloque([]);

    setFeedback("");

    setResultado(null);

    setFinalizado(false);

    setTiempo(60);

    setBloqueActual(0);

    setMostrarRetroBloque(false);

    cargarPreguntas();
  };

  // CARGANDO
  if (cargando) {
    return (
      <section id="center">
        <div className="center">
          <h1>Simulador EGEL</h1>

          <p>Cargando preguntas...</p>
        </div>
      </section>
    );
  }

  // RESULTADO FINAL
  if (finalizado) {
    return (
      <section id="center">
        <div className="center">
          <h1>Resultado Final</h1>

          <div className="result-box">
            <p>Aciertos: {resultado.aciertos}</p>

            <p>Total de preguntas: {resultado.total}</p>

            <p>Porcentaje: {resultado.porcentaje}%</p>
          </div>

          {justificaciones.length > 0 && (
            <div className="justifications-box">
              <h3>Errores de toda la evaluación</h3>

              {justificaciones.map((j) => (
                <div key={j.id} className="justification-item">
                  <p className="subarea">{j.subarea}</p>

                  <p>{j.justificacion}</p>
                </div>
              ))}
            </div>
          )}

          <div className="actions">
            <button className="btn" onClick={reiniciarExamen}>
              Nuevo intento
            </button>

            <button
              className="btn"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                localStorage.removeItem("userId");

                window.location.reload();
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </section>
    );
  }

  // RETRO DEL BLOQUE
  if (mostrarRetroBloque) {
    const preguntasBloque = preguntas.length;

    let aciertosBloque = 0;

    preguntas.forEach((p) => {
      if (respuestas[p._id]?.correcta) {
        aciertosBloque++;
      }
    });

    return (
      <section id="center">
        <div className="center">
          <h1>Bloque {bloqueActual + 1} finalizado</h1>

          <div className="result-box">
            <p>Aciertos: {aciertosBloque}</p>

            <p>Total: {preguntasBloque}</p>

            <p>
              Porcentaje:{" "}
              {((aciertosBloque / preguntasBloque) * 100).toFixed(0)}%
            </p>
          </div>

          {justificacionesBloque.length > 0 && (
            <div className="justifications-box">
              <h3>Errores del bloque</h3>

              {justificacionesBloque.map((j) => (
                <div key={j.id} className="justification-item">
                  <p className="subarea">{j.subarea}</p>

                  <p>{j.justificacion}</p>
                </div>
              ))}
            </div>
          )}

          <div className="actions">
            <button className="btn" onClick={siguienteBloque}>
              {bloqueActual === bloques.length - 1
                ? "Ver resultados finales"
                : `Continuar al bloque ${bloqueActual + 2}`}
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ERROR
  if (!preguntas.length || !preguntaActual) {
    return (
      <section id="center">
        <div className="center">
          <h1>Simulador EGEL</h1>

          <p>No se pudieron cargar preguntas.</p>

          <button className="btn" onClick={cargarPreguntas}>
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  // EXAMEN
  return (
    <section id="center">
      <div className="center exam-box">
        <h1>Simulador EGEL</h1>

        <p>
          Bloque {bloqueActual + 1} de {bloques.length}
        </p>

        <p>
          Pregunta {indiceActual + 1} de {preguntas.length}
        </p>

        <p className="timer">Tiempo restante: {tiempo}s</p>

        <div className="progress">
          <div
            className="progress-bar"
            style={{
              width: `${((indiceActual + 1) / preguntas.length) * 100}%`,
            }}
          ></div>
        </div>

        <div className="question-card">
          <span className="badge">
            {preguntaActual.subarea} - {preguntaActual.nivel}
          </span>

          <h3>{preguntaActual.pregunta}</h3>

          <div className="options">
            {preguntaActual.opciones.map((opcion, i) => {
              const seleccion = respuestas[preguntaActual._id];

              const esSeleccionado = seleccion?.index === i;

              return (
                <button
                  key={i}
                  className={`option-btn ${esSeleccionado ? "selected" : ""}`}
                  onClick={() => responder(opcion, i)}
                >
                  {opcion}
                </button>
              );
            })}
          </div>

          {feedback && (
            <div
              className={`feedback ${
                feedback.includes("correcta") ? "correct" : "incorrect"
              }`}
            >
              <p>{feedback}</p>
            </div>
          )}
        </div>

        <div className="actions">
          <button className="btn" onClick={siguiente}>
            {indiceActual === preguntas.length - 1
              ? "Finalizar bloque"
              : "Siguiente"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default App;
