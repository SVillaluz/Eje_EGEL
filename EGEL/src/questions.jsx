import { useEffect, useState } from "react";
import "./questions.css";

const API_URL = "http://localhost:5000/api";

const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

function Questions({
  initialBloque = 0,
  initialAciertos = 0,
  initialIntento = 1,
  onExit,
}) {
  const [preguntas, setPreguntas] = useState([]);
  const [bloqueActual, setBloqueActual] = useState(initialBloque);
  const [bloquePreguntas, setBloquePreguntas] = useState([]);
  const [indiceActual, setIndiceActual] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [justificaciones, setJustificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [finalizado, setFinalizado] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [aciertosAcumulados, setAciertosAcumulados] = useState(initialAciertos);
  const [intentoBloque, setIntentoBloque] = useState(initialIntento);
  const [mensaje, setMensaje] = useState("");
  const [mostrarRetro, setMostrarRetro] = useState(false);
  const [bloqueResultado, setBloqueResultado] = useState(null);
  const [bloqueJustificaciones, setBloqueJustificaciones] = useState([]);

  useEffect(() => {
    cargarPreguntas();
  }, []);

  const cargarPreguntas = async () => {
    try {
      const res = await fetch(`${API_URL}/preguntas/random?size=60`);
      const data = await res.json();
      setPreguntas(data);
      // Preparar bloque inicial inmediatamente después de cargar preguntas
      setTimeout(() => {
        prepararBloqueConPreguntas(data, initialBloque, initialIntento);
      }, 0);
    } catch (error) {
      console.error(error);
      setMensaje(
        "No se pudieron cargar las preguntas. Intenta de nuevo más tarde.",
      );
    } finally {
      setCargando(false);
    }
  };

  const prepararBloqueConPreguntas = (preguntasArray, bloqueIndex, intento) => {
    const inicio = bloqueIndex * 5;
    const bloque = preguntasArray.slice(inicio, inicio + 5).map((pregunta) => ({
      ...pregunta,
      opcionesBarajadas: shuffleArray(pregunta.opciones),
      respuestaCorrecta: Number.isNaN(Number(pregunta.correcta))
        ? pregunta.correcta
        : pregunta.opciones[Number(pregunta.correcta)],
    }));

    setBloqueActual(bloqueIndex);
    setIntentoBloque(intento);
    setAciertosAcumulados(initialAciertos);
    setBloquePreguntas(shuffleArray(bloque));
    setRespuestas({});
    setIndiceActual(0);
  };

  const prepararBloque = (bloqueIndex, reiniciarIntento = false) => {
    if (!preguntas || preguntas.length === 0) {
      console.error("Preguntas no disponibles");
      return;
    }

    const inicio = bloqueIndex * 5;
    const bloque = preguntas.slice(inicio, inicio + 5).map((pregunta) => ({
      ...pregunta,
      opcionesBarajadas: shuffleArray(pregunta.opciones),
      respuestaCorrecta: Number.isNaN(Number(pregunta.correcta))
        ? pregunta.correcta
        : pregunta.opciones[Number(pregunta.correcta)],
    }));

    if (bloque.length === 0) {
      console.error("No hay preguntas para el bloque", bloqueIndex);
      return;
    }

    setBloquePreguntas(shuffleArray(bloque));
    setRespuestas({});
    setIndiceActual(0);
    if (reiniciarIntento) {
      setIntentoBloque(1);
      setMensaje("");
    }
  };

  const preguntaActual = bloquePreguntas[indiceActual];

  const responder = (opcion, index) => {
    if (!preguntaActual) return;

    const esCorrecta = opcion === preguntaActual.respuestaCorrecta;
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
      setJustificaciones((prev) => {
        if (prev.some((j) => j.id === preguntaActual._id)) return prev;
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

  const allAnswered =
    bloquePreguntas.length > 0 &&
    bloquePreguntas.every((pregunta) => respuestas[pregunta._id]);

  const correctCount = bloquePreguntas.reduce((count, pregunta) => {
    if (respuestas[pregunta._id]?.correcta) {
      return count + 1;
    }
    return count;
  }, 0);

  const guardaRonda = async (allCorrect) => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const totalCorrectAfterRound = allCorrect
      ? aciertosAcumulados + correctCount
      : aciertosAcumulados;

    const payload = {
      userId,
      roundNumber: bloqueActual + 1,
      attemptNumber: intentoBloque,
      allCorrect,
      correctCount,
      puntaje: correctCount,
      totalCorrectSoFar: aciertosAcumulados,
      totalCorrectAfterRound,
      respuestas: bloquePreguntas.map((pregunta) => ({
        preguntaId: pregunta._id,
        pregunta: pregunta.pregunta,
        respuestaSeleccionada: respuestas[pregunta._id]?.opcion || null,
        correcta: respuestas[pregunta._id]?.correcta || false,
      })),
    };

    try {
      await fetch(`${API_URL}/respuestas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Error guardando ronda:", error);
    }
  };

  const continuarDespuesDeRetro = () => {
    if (!bloqueResultado) return;

    setMostrarRetro(false);
    setMensaje("");

    if (bloqueResultado.allCorrect) {
      const total = aciertosAcumulados + bloqueResultado.correctCount;
      setAciertosAcumulados(total);

      if (total >= 60) {
        terminarExamen(total);
        return;
      }

      const siguienteBloque = bloqueActual + 1;
      setBloqueActual(siguienteBloque);
      prepararBloque(siguienteBloque, true);
      setMensaje("Correcto. Avanzas al siguiente bloque de 5 preguntas.");
      return;
    }

    setIntentoBloque(intentoBloque + 1);
    prepararBloque(bloqueActual, false);
    setMensaje(
      "Fallaste alguna pregunta. Vuelve a contestar este mismo bloque en orden distinto.",
    );
  };

  const terminarEnRetro = () => {
    if (!bloqueResultado) return;

    if (onExit) {
      onExit();
      return;
    }

    const total = bloqueResultado.allCorrect
      ? aciertosAcumulados + bloqueResultado.correctCount
      : aciertosAcumulados;
    terminarExamen(total);
  };

  const siguiente = async () => {
    if (!preguntaActual) return;

    if (!respuestas[preguntaActual._id]) {
      alert(
        "Seleccione una opción para poder continuar con el resto de preguntas",
      );
      return;
    }

    if (indiceActual < bloquePreguntas.length - 1) {
      setIndiceActual(indiceActual + 1);
      return;
    }

    if (!allAnswered) {
      alert("Contesta todas las preguntas del bloque antes de finalizar.");
      return;
    }

    const allCorrect = correctCount === bloquePreguntas.length;
    await guardaRonda(allCorrect);

    const justificacionesBloque = bloquePreguntas
      .filter((pregunta) => respuestas[pregunta._id]?.correcta === false)
      .map((pregunta) => ({
        id: pregunta._id,
        subarea: pregunta.subarea,
        justificacion:
          pregunta.justificacion ||
          pregunta.explicacion ||
          "Respuesta incorrecta. Revisa la explicación.",
      }));

    setBloqueJustificaciones(justificacionesBloque);
    setBloqueResultado({
      allCorrect,
      correctCount,
      totalEnBloque: bloquePreguntas.length,
    });
    setMostrarRetro(true);
  };

  const anterior = () => {
    if (indiceActual > 0) {
      setIndiceActual(indiceActual - 1);
    }
  };

  const terminarExamen = (total) => {
    setResultado({
      total: 60,
      aciertos: total,
      porcentaje: ((total / 60) * 100).toFixed(0),
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
              <h3>Justificaciones</h3>
              {justificaciones.map((j) => (
                <div key={j.id} className="justification-item">
                  <p className="subarea">{j.subarea}</p>
                  <p>{j.justificacion}</p>
                </div>
              ))}
            </div>
          )}

          <button
            className="btn"
            onClick={onExit || (() => window.location.reload())}
          >
            Volver al menú
          </button>
        </div>
      </section>
    );
  }

  if (mostrarRetro && bloqueResultado) {
    return (
      <section id="center">
        <div className="center exam-box">
          <h1>Retro del Bloque {bloqueActual + 1}</h1>

          <div className="result-box">
            <p>
              Correctas en este bloque: {bloqueResultado.correctCount} de{" "}
              {bloqueResultado.totalEnBloque}
            </p>
            <p>
              Estado:{" "}
              {bloqueResultado.allCorrect
                ? "Todas correctas"
                : "Hubo errores en el bloque"}
            </p>
          </div>

          {bloqueJustificaciones.length > 0 ? (
            <div className="justifications-box">
              <h3>Justificaciones del bloque</h3>
              {bloqueJustificaciones.map((j) => (
                <div key={j.id} className="justification-item">
                  <p className="subarea">{j.subarea}</p>
                  <p>{j.justificacion}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No hay respuestas incorrectas en este bloque.</p>
          )}

          <div className="actions">
            <button className="btn" onClick={continuarDespuesDeRetro}>
              Continuar
            </button>
            <button className="btn btn-secondary" onClick={terminarEnRetro}>
              Terminar
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="center">
      <div className="center exam-box">
        <h1>Simulador EGEL</h1>
        <p>
          Bloque {bloqueActual + 1} de {Math.ceil(preguntas.length / 5)}
        </p>
        <p>Intento en este bloque: {intentoBloque}</p>
        <p>Correctas acumuladas: {aciertosAcumulados} / 60</p>

        <p>
          Pregunta {indiceActual + 1} de {bloquePreguntas.length}
        </p>

        <div className="progress">
          <div
            className="progress-bar"
            style={{
              width: `${((aciertosAcumulados + correctCount) / 60) * 100}%`,
            }}
          ></div>
        </div>

        {mensaje && <p style={{ marginTop: 16 }}>{mensaje}</p>}

        {preguntaActual && (
          <div className="question-card">
            <span className="badge">
              {preguntaActual.subarea} - {preguntaActual.nivel}
            </span>

            <h3>{preguntaActual.pregunta}</h3>

            <div className="options">
              {preguntaActual.opcionesBarajadas.map((opcion, i) => {
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
            {indiceActual === bloquePreguntas.length - 1
              ? "Finalizar"
              : "Siguiente"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default Questions;
