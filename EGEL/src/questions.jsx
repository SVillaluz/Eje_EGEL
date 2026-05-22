import { useEffect, useState } from "react";
import "./questions.css";

function App() {
  const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

  // =========================
  // ALEATORIZAR OPCIONES
  // =========================
  const aleatorizarOpciones = (pregunta) => {
    const opcionesOriginales = [...pregunta.opciones];

    const respuestaCorrectaTexto = Number.isNaN(Number(pregunta.correcta))
      ? pregunta.correcta
      : opcionesOriginales[Number(pregunta.correcta)];

    const opcionesMezcladas = [...opcionesOriginales];

    // Fisher-Yates
    for (let i = opcionesMezcladas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [opcionesMezcladas[i], opcionesMezcladas[j]] = [
        opcionesMezcladas[j],
        opcionesMezcladas[i],
      ];
    }

    const nuevaCorrectaIndex = opcionesMezcladas.findIndex(
      (op) => op === respuestaCorrectaTexto,
    );

    return {
      ...pregunta,
      opciones: opcionesMezcladas,
      correcta: nuevaCorrectaIndex,
      respuestaCorrectaTexto,
    };
  };

  // =========================
  // ORDEN ONTOLÓGICO
  // =========================
  const ordenarPreguntasOntologia = (preguntas) => {
    const nivelPrioridad = {
      Básico: 1,
      Intermedio: 2,
      Avanzado: 3,
      Experto: 4,
    };

    const preguntasConNivel = preguntas.map((p) => ({
      ...p,
      nivelOrden: nivelPrioridad[p.nivel] || 2,
    }));

    const porSubarea = {};

    preguntasConNivel.forEach((p) => {
      if (!porSubarea[p.subarea]) {
        porSubarea[p.subarea] = [];
      }

      porSubarea[p.subarea].push(p);
    });

    Object.keys(porSubarea).forEach((subarea) => {
      porSubarea[subarea].sort((a, b) => a.nivelOrden - b.nivelOrden);
    });

    const resultado = [];

    const subareas = Object.keys(porSubarea);

    const maxPreguntas = Math.max(...subareas.map((s) => porSubarea[s].length));

    for (let i = 0; i < maxPreguntas; i++) {
      for (const subarea of subareas) {
        if (porSubarea[subarea][i]) {
          resultado.push(porSubarea[subarea][i]);
        }
      }
    }

    return resultado;
  };

  // =========================
  // PROCESAR BLOQUE
  // =========================
  const procesarBloque = (bloque) => {
    const preguntasOrdenadas = ordenarPreguntasOntologia(bloque.preguntas);

    const preguntasAleatorias = preguntasOrdenadas.map((pregunta) =>
      aleatorizarOpciones(pregunta),
    );

    return {
      ...bloque,
      preguntas: preguntasAleatorias,
    };
  };

  // =========================
  // ESTADOS
  // =========================
  const [bloques, setBloques] = useState([]);

  const [bloqueActual, setBloqueActual] = useState(0);

  const [preguntas, setPreguntas] = useState([]);

  const [indiceActual, setIndiceActual] = useState(0);

  const [respuestas, setRespuestas] = useState({});

  const [cargando, setCargando] = useState(true);

  const [mostrarRetroBloque, setMostrarRetroBloque] = useState(false);

  const [finalizado, setFinalizado] = useState(false);

  const [resultado, setResultado] = useState(null);

  const [tiempo, setTiempo] = useState(60);

  const [errorValidacion, setErrorValidacion] = useState("");

  const [mostrarFeedbackRespuesta, setMostrarFeedbackRespuesta] =
    useState(false);

  const [respuestaEsCorrecta, setRespuestaEsCorrecta] = useState(null);

  const [justificaciones, setJustificaciones] = useState([]);

  // =========================
  // CARGAR PREGUNTAS
  // =========================
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
        const bloquesProcesados = data.bloques.map((bloque) =>
          procesarBloque(bloque),
        );

        setBloques(bloquesProcesados);

        setPreguntas(bloquesProcesados[0].preguntas);

        setBloqueActual(0);
      } else {
        setPreguntas([]);
      }
    } catch (error) {
      console.error(error);

      setPreguntas([]);
    } finally {
      setCargando(false);
    }
  };

  const preguntaActual = preguntas[indiceActual];

  // =========================
  // LIMPIAR FEEDBACK
  // =========================
  useEffect(() => {
    setErrorValidacion("");

    setMostrarFeedbackRespuesta(false);

    setRespuestaEsCorrecta(null);
  }, [indiceActual]);

  // =========================
  // TEMPORIZADOR
  // =========================
  useEffect(() => {
    if (finalizado || cargando || mostrarRetroBloque || !preguntas.length) {
      return;
    }

    const timer = setTimeout(() => {
      setTiempo((prev) => prev - 1);
    }, 1000);

    if (tiempo <= 0) {
      if (!respuestas[preguntaActual._id]) {
        setRespuestas((prev) => ({
          ...prev,
          [preguntaActual._id]: {
            opcion: null,
            index: null,
            correcta: false,
          },
        }));
      }

      if (indiceActual < preguntas.length - 1) {
        setIndiceActual((prev) => prev + 1);

        setTiempo(60);
      } else {
        setMostrarRetroBloque(true);
      }
    }

    return () => clearTimeout(timer);
  }, [
    tiempo,
    finalizado,
    cargando,
    mostrarRetroBloque,
    preguntas,
    indiceActual,
    respuestas,
    preguntaActual,
  ]);

  // =========================
  // RESPONDER
  // =========================
  const responder = (opcion, index) => {
    const esCorrecta = opcion === preguntaActual.respuestaCorrectaTexto;

    setRespuestas((prev) => ({
      ...prev,
      [preguntaActual._id]: {
        opcion,
        index,
        correcta: esCorrecta,
      },
    }));
  };

  // =========================
  // SIGUIENTE
  // =========================
  const siguiente = () => {
    if (!respuestas[preguntaActual._id]) {
      setErrorValidacion("Seleccione una opción para continuar");

      return;
    }

    if (!mostrarFeedbackRespuesta) {
      const esCorrecta = respuestas[preguntaActual._id].correcta;

      setRespuestaEsCorrecta(esCorrecta);

      setMostrarFeedbackRespuesta(true);

      return;
    }

    setMostrarFeedbackRespuesta(false);

    setRespuestaEsCorrecta(null);

    if (indiceActual < preguntas.length - 1) {
      setIndiceActual((prev) => prev + 1);

      setTiempo(60);

      return;
    }

    setMostrarRetroBloque(true);
  };

  // =========================
  // SIGUIENTE BLOQUE
  // =========================
  const siguienteBloque = () => {
    if (bloqueActual >= bloques.length - 1) {
      terminarExamen();

      return;
    }

    const nuevoBloque = bloqueActual + 1;

    setBloqueActual(nuevoBloque);

    setPreguntas(bloques[nuevoBloque].preguntas);

    setIndiceActual(0);

    setTiempo(60);

    setMostrarRetroBloque(false);
  };

  // =========================
  // TERMINAR EXAMEN
  // =========================
  const terminarExamen = async () => {
    let aciertos = 0;

    const justificacionesErrores = [];

    bloques.forEach((bloque) => {
      bloque.preguntas.forEach((pregunta) => {
        const respuesta = respuestas[pregunta._id];

        if (respuesta?.correcta) {
          aciertos++;
        } else {
          justificacionesErrores.push({
            id: pregunta._id,
            subarea: pregunta.subarea,
            justificacion:
              pregunta.justificacion ||
              pregunta.explicacion ||
              "Respuesta incorrecta",
          });
        }
      });
    });

    const resultadoFinal = {
      total: 60,
      aciertos,
      porcentaje: ((aciertos / 60) * 100).toFixed(0),
    };

    setResultado(resultadoFinal);

    setJustificaciones(justificacionesErrores);

    setMostrarRetroBloque(false);

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      await fetch(`${API_URL}/resultados/evaluacion`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          userId: user?.id,
          bloques,
          respuestas,
          resultadoFinal,
        }),
      });

      setFinalizado(true);
    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // REINICIAR
  // =========================
  const reiniciarExamen = () => {
    setIndiceActual(0);

    setRespuestas({});

    setResultado(null);

    setFinalizado(false);

    setTiempo(60);

    setBloqueActual(0);

    setMostrarRetroBloque(false);

    setJustificaciones([]);

    cargarPreguntas();
  };

  // =========================
  // CARGANDO
  // =========================
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

  // =========================
  // RESULTADO FINAL
  // =========================
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

  // =========================
  // RETRO BLOQUE
  // =========================
  if (mostrarRetroBloque) {
    let aciertosBloque = 0;

    preguntas.forEach((p) => {
      if (respuestas[p._id]?.correcta) {
        aciertosBloque++;
      }
    });

    const erroresBloque = [];

    preguntas.forEach((p) => {
      const resp = respuestas[p._id];

      if (!resp?.correcta) {
        erroresBloque.push({
          id: p._id,
          subarea: p.subarea,
          justificacion:
            p.justificacion || p.explicacion || "Respuesta incorrecta",
        });
      }
    });

    return (
      <section id="center">
        <div className="center">
          <h1>Bloque {bloqueActual + 1} finalizado</h1>

          <div className="result-box">
            <p>Aciertos: {aciertosBloque}</p>

            <p>Total: {preguntas.length}</p>

            <p>
              Porcentaje:{" "}
              {((aciertosBloque / preguntas.length) * 100).toFixed(0)}%
            </p>
          </div>

          {erroresBloque.length > 0 && (
            <div className="justifications-box">
              <h3>Errores del bloque</h3>

              {erroresBloque.map((j) => (
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

  // =========================
  // ERROR
  // =========================
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

  // =========================
  // EXAMEN
  // =========================
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

        <progress
          className="progress"
          value={((indiceActual + 1) / preguntas.length) * 100}
          max="100"
        ></progress>

        <div className="question-card">
          <span className="badge">
            {preguntaActual.subarea} - {preguntaActual.nivel}
          </span>

          <h3>{preguntaActual.pregunta}</h3>

          {errorValidacion && (
            <div className="validation-error">
              <p>{errorValidacion}</p>
            </div>
          )}

          <div className="options">
            {preguntaActual.opciones.map((opcion, i) => {
              const seleccion = respuestas[preguntaActual._id];

              const esSeleccionado = seleccion?.index === i;

              return (
                <button
                  key={i}
                  className={`option-btn ${esSeleccionado ? "selected" : ""}`}
                  onClick={() => responder(opcion, i)}
                  disabled={mostrarFeedbackRespuesta}
                >
                  {opcion}
                </button>
              );
            })}
          </div>

          {mostrarFeedbackRespuesta && (
            <div
              className={`respuesta-feedback ${
                respuestaEsCorrecta ? "correcta" : "incorrecta"
              }`}
            >
              <p>
                {respuestaEsCorrecta
                  ? "¡Respuesta Correcta!"
                  : "¡Respuesta Incorrecta!"}
              </p>

              <p className="respuesta-seleccionada">
                Tu respuesta: {respuestas[preguntaActual._id]?.opcion}
              </p>

              {!respuestaEsCorrecta && (
                <p className="respuesta-correcta">
                  Respuesta correcta: {preguntaActual.respuestaCorrectaTexto}
                </p>
              )}
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
