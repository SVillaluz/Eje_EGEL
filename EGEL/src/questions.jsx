import { useEffect, useState } from "react";
import "./questions.css";

function App() {
  const API_URL = "http://localhost:5000/api";

  const [preguntas, setPreguntas] = useState([]);
  const [indiceActual, setIndiceActual] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [temaStats, setTemaStats] = useState({});
  const [cargando, setCargando] = useState(true);
  const [finalizado, setFinalizado] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [mensajeTema, setMensajeTema] = useState("");
  const [justificaciones, setJustificaciones] = useState([]);

  useEffect(() => {
    cargarPreguntas();
  }, []);

  const cargarPreguntas = async () => {
    try {
      const res = await fetch(`${API_URL}/preguntas/random`);
      const data = await res.json();
      setPreguntas(data);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const cargarPreguntasExtraPorTema = async (tema) => {
    try {
      const excludeIds = preguntas.map((p) => p._id).join(",");
      const res = await fetch(
        `${API_URL}/preguntas/by-subarea/${encodeURIComponent(
          tema,
        )}?size=5&excludeIds=${excludeIds}`,
      );

      if (!res.ok) {
        return [];
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const preguntaActual = preguntas[indiceActual];

  const responder = async (opcion) => {
    if (!preguntaActual) return;

    const respuestaAnterior = respuestas[preguntaActual._id];
    if (respuestaAnterior === opcion) {
      return;
    }

    const nuevaRespuesta = {
      ...respuestas,
      [preguntaActual._id]: opcion,
    };

    setRespuestas(nuevaRespuesta);

    const esCorrecta = opcion === preguntaActual.correcta;
    setFeedback(esCorrecta ? "Respuesta correcta." : "Respuesta incorrecta.");

    if (!respuestaAnterior) {
      const { updatedPreguntas } = await procesarRespuestaActual(opcion, preguntaActual);

      const ultimaPregunta = indiceActual === updatedPreguntas.length - 1;
      const todasContestadas = Object.keys(nuevaRespuesta).length === updatedPreguntas.length;

      if (ultimaPregunta && todasContestadas) {
        terminarExamen(updatedPreguntas);
      }
    }
  };

  const procesarRespuestaActual = async (seleccion, pregunta, respuestasActuales) => {
    if (!pregunta) {
      return { updatedPreguntas: preguntas };
    }

    if (!seleccion) {
      return { updatedPreguntas: preguntas };
    }

    const esCorrecta = seleccion === pregunta.correcta;
    const tema = pregunta.subarea;

    const prevStats = temaStats[tema] || {
      totalFirstStage: 0,
      correctFirstStage: 0,
      extraRequested: false,
      extraFetched: false,
      extraStageTotal: 0,
      extraStageCorrect: 0,
      completed: false,
      showJustifications: false,
    };

    const stats = { ...prevStats };

    if (!prevStats.extraRequested) {
      stats.totalFirstStage += 1;
      if (esCorrecta) {
        stats.correctFirstStage += 1;
      }

      if (stats.totalFirstStage === 3) {
        if (stats.correctFirstStage >= 3) {
          stats.completed = true;
        } else {
          stats.extraRequested = true;
        }
      }
    } else if (!prevStats.completed) {
      stats.extraStageTotal += 1;
      if (esCorrecta) {
        stats.extraStageCorrect += 1;
      }

      if (stats.extraStageTotal === 3) {
        if (stats.extraStageCorrect >= 3) {
          stats.completed = true;
        } else {
          stats.showJustifications = true;
        }
      }
    }

    setTemaStats((prev) => ({
      ...prev,
      [tema]: stats,
    }));

    if (
      !esCorrecta &&
      (stats.showJustifications || (stats.extraStageTotal === 3 && stats.extraStageCorrect < 3))
    ) {
      const justificacion =
        pregunta.justificacion ||
        pregunta.explicacion ||
        "Consulta la explicación oficial de este tema.";

      setJustificaciones((prev) => {
        if (prev.some((item) => item.id === pregunta._id)) {
          return prev;
        }

        return [
          ...prev,
          {
            id: pregunta._id,
            pregunta: pregunta.pregunta,
            justificacion,
          },
        ];
      });
    }

    if (stats.completed && !prevStats.completed) {
      setMensajeTema(
        `¡Excelente! Ya no recibirás más preguntas del tema "${tema}".`,
      );

      const filtered = preguntas.filter((_, index) => {
        return index <= indiceActual || preguntas[index].subarea !== tema;
      });

      setPreguntas(filtered);
      return { updatedPreguntas: filtered };
    }

    if (stats.extraRequested && !prevStats.extraFetched && stats.totalFirstStage === 3) {
      setMensajeTema(
        `No alcanzaste 3 correctas en "${tema}". Se agregaron 5 preguntas adicionales de refuerzo.`,
      );

      const extraPreguntas = await cargarPreguntasExtraPorTema(tema);
      const existingIds = new Set(preguntas.map((p) => p._id));
      const nuevas = extraPreguntas.filter((p) => !existingIds.has(p._id));

      setTemaStats((prev) => ({
        ...prev,
        [tema]: { ...stats, extraFetched: true },
      }));

      if (nuevas.length > 0) {
        const updatedPreguntas = [...preguntas, ...nuevas];
        setPreguntas(updatedPreguntas);
        return { updatedPreguntas };
      }
    }

    if (stats.showJustifications && !prevStats.showJustifications) {
      setMensajeTema(
        `Aún necesitas refuerzo en "${tema}". Revisa las justificaciones de las preguntas incorrectas.`,
      );
    }

    return { updatedPreguntas: preguntas };
  };

  const siguiente = () => {
    if (!preguntaActual) return;

    if (!respuestas[preguntaActual._id]) {
      alert("Seleccione una opción para poder continuar con el resto de preguntas");
      return;
    }

    if (indiceActual < preguntas.length - 1) {
      setIndiceActual(indiceActual + 1);
    } else {
      terminarExamen(preguntas);
    }
  };

  const anterior = () => {
    if (indiceActual > 0) {
      setIndiceActual(indiceActual - 1);
      setFeedback("");
    }
  };

  const terminarExamen = (listaPreguntas = preguntas) => {
    let aciertos = 0;

    listaPreguntas.forEach((p) => {
      if (respuestas[p._id] === p.correcta) {
        aciertos++;
      }
    });

    setResultado({
      total: listaPreguntas.length,
      aciertos,
      porcentaje: ((aciertos / listaPreguntas.length) * 100).toFixed(0),
    });

    setFinalizado(true);
  };

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

  if (!preguntaActual) {
    return (
      <section id="center">
        <div className="center">
          <h1>Simulador EGEL</h1>
          <p>No hay preguntas disponibles en este momento.</p>
        </div>
      </section>
    );
  }

  if (finalizado) {
    return (
      <section id="center">
        <div className="center">
          <h1>Resultado Final</h1>

          <div className="result-box">
            <p>Aciertos: {resultado?.aciertos ?? 0}</p>
            <p>Total: {resultado?.total ?? 0}</p>
            <p>Porcentaje: {resultado?.porcentaje ?? 0}%</p>
          </div>

          <button className="btn" onClick={() => window.location.reload()}>
            Nuevo intento
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="center">
      <div className="center exam-box">
        <h1>Simulador EGEL</h1>

        <p>
          Pregunta {indiceActual + 1} de {preguntas.length}
        </p>

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
            {preguntaActual.opciones.map((opcion, i) => (
              <button
                key={i}
                className={`option-btn ${
                  respuestas[preguntaActual._id] === opcion ? "selected" : ""
                }`}
                onClick={() => responder(opcion)}
              >
                {opcion}
              </button>
            ))}
          </div>

          {feedback && <p className="feedback">{feedback}</p>}
        </div>

        {mensajeTema && <div className="topic-message">{mensajeTema}</div>}

        {justificaciones.length > 0 && (
          <div className="justification-box">
            <h3>Justificaciones</h3>
            {justificaciones.map((item) => (
              <div key={item.id} className="justification-item">
                <p className="question-title">{item.pregunta}</p>
                <p>{item.justificacion}</p>
              </div>
            ))}
          </div>
        )}

        <div className="actions">
          <button
            className="btn"
            onClick={anterior}
            disabled={indiceActual === 0}
          >
            Anterior
          </button>

          <button className="btn" onClick={siguiente}>
            {indiceActual === preguntas.length - 1 ? "Finalizar" : "Siguiente"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default App;
