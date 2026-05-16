import { useEffect, useState } from "react";
import "./questions.css";

function App() {
  const API_URL = "http://localhost:5000/api";

  const [preguntas, setPreguntas] = useState([]);
  const [indiceActual, setIndiceActual] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [cargando, setCargando] = useState(true);
  const [finalizado, setFinalizado] = useState(false);
  const [resultado, setResultado] = useState(null);

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

  const preguntaActual = preguntas[indiceActual];

  const responder = (opcion, index) => {
    const correctaIndex = Number.isNaN(Number(preguntaActual.correcta))
      ? preguntaActual.opciones.findIndex((item) => item === preguntaActual.correcta)
      : Number(preguntaActual.correcta);

    const esCorrecta = index === correctaIndex;

    setRespuestas({
      ...respuestas,
      [preguntaActual._id]: {
        opcion,
        index,
        correcta: esCorrecta,
      },
    });
  };

  const siguiente = () => {
    // Validar que se haya seleccionado una opción
    if (!respuestas[preguntaActual._id]) {
      alert("Seleccione una opción para poder continuar con el resto de preguntas");
      return;
    }

    if (indiceActual < preguntas.length - 1) {
      setIndiceActual(indiceActual + 1);
    } else {
      terminarExamen();
    }
  };

  const anterior = () => {
    if (indiceActual > 0) {
      setIndiceActual(indiceActual - 1);
    }
  };

  const terminarExamen = () => {
    let aciertos = 0;

    preguntas.forEach((p) => {
      if (respuestas[p._id]?.correcta) {
        aciertos++;
      }
    });

    setResultado({
      total: preguntas.length,
      aciertos,
      porcentaje: ((aciertos / preguntas.length) * 100).toFixed(0),
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
        </div>

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
