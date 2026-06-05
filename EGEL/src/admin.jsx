import { useEffect, useMemo, useState } from "react";
import "./admin.css";

function AdminPanel({ onBack }) {
  const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

  const [evaluaciones, setEvaluaciones] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [notAuthorized, setNotAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const temasPorAlumno = useMemo(() => {
    const summary = {};

    evaluaciones.forEach((evaluacion) => {
      const userId = evaluacion.userId?._id ?? evaluacion.userId;
      const key = userId?.toString() || evaluacion.username || evaluacion.email;

      if (!summary[key]) {
        summary[key] = {};
      }

      evaluacion.bloques?.forEach((bloque) => {
        bloque.preguntas?.forEach((pregunta) => {
          const subarea = pregunta.subarea || pregunta.area || "Sin tema";

          if (!summary[key][subarea]) {
            summary[key][subarea] = { correctas: 0, total: 0 };
          }

          summary[key][subarea].total += 1;
          if (pregunta.correcta) {
            summary[key][subarea].correctas += 1;
          }
        });
      });
    });

    return Object.fromEntries(
      Object.entries(summary).map(([key, temas]) => {
        const temasPromedio = Object.entries(temas).map(([subarea, valores]) => ({
          subarea,
          porcentaje: valores.total
            ? Math.round((valores.correctas / valores.total) * 100)
            : 0,
        }));

        const topDominados = [...temasPromedio]
          .sort((a, b) => b.porcentaje - a.porcentaje)
          .slice(0, 3);

        const menosDominados = [...temasPromedio]
          .sort((a, b) => a.porcentaje - b.porcentaje)
          .slice(0, 3);

        return [key, { topDominados, menosDominados }];
      }),
    );
  }, [evaluaciones]);

  useEffect(() => {
    cargarEvaluaciones();
  }, []);

  useEffect(() => {
    if (!evaluaciones.length) {
      setRanking([]);
      return;
    }

    const PASS_THRESHOLD = 60;
    const summary = evaluaciones.reduce((acc, evaluacion) => {
      const userId = evaluacion.userId?._id ?? evaluacion.userId;
      const key = userId?.toString() || evaluacion.username || evaluacion.email;

      if (!acc[key]) {
        acc[key] = {
          userId: userId || key,
          username: evaluacion.username,
          email: evaluacion.email,
          totalExamenes: 0,
          aprobados: 0,
          reprobados: 0,
          sumaPorcentaje: 0,
        };
      }

      const porcentaje = Number(evaluacion.resultadoFinal?.porcentaje ?? 0);
      const isAprobado = porcentaje >= PASS_THRESHOLD;

      acc[key].totalExamenes += 1;
      acc[key].aprobados += isAprobado ? 1 : 0;
      acc[key].reprobados += isAprobado ? 0 : 1;
      acc[key].sumaPorcentaje += porcentaje;

      return acc;
    }, {});

    const rankingData = Object.values(summary).map((user) => ({
      ...user,
      promedioPorcentaje: user.totalExamenes
        ? Math.round(user.sumaPorcentaje / user.totalExamenes)
        : 0,
    }));

    rankingData.sort((a, b) => {
      if (b.totalExamenes !== a.totalExamenes) {
        return b.totalExamenes - a.totalExamenes;
      }
      if (b.aprobados !== a.aprobados) {
        return b.aprobados - a.aprobados;
      }
      return b.promedioPorcentaje - a.promedioPorcentaje;
    });

    setRanking(rankingData);
  }, [evaluaciones]);

  const cargarEvaluaciones = async () => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (!token || !user || user.role !== "admin") {
        setNotAuthorized(true);
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/admin/evaluaciones`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setNotAuthorized(true);
        setLoading(false);
        return;
      }

      const data = await res.json();

      setEvaluaciones(data);
    } catch (error) {
      console.error(error);
      setNotAuthorized(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="admin-container">
        <h1>Panel Administrador</h1>
        <p>Cargando evaluaciones...</p>
      </section>
    );
  }

  if (notAuthorized) {
    return (
      <section className="admin-container">
        <h1>Acceso denegado</h1>
        <p>No tienes permisos para ver este contenido.</p>
        {onBack && (
          <button className="btn" onClick={onBack}>
            Volver
          </button>
        )}
      </section>
    );
  }

  return (
    <section className="admin-container">
      <div className="admin-header">
        <h1>Panel Administrador</h1>
        {onBack && (
          <button className="btn" onClick={onBack}>
            Volver
          </button>
        )}
      </div>

      {ranking.length > 0 && (
        <section className="ranking-panel">
          <div className="ranking-header">
            <h2>Ranking de alumnos</h2>
            <p>Alumnos ordenados por el total de exámenes realizados.</p>
          </div>

          <div className="ranking-cards">
            {ranking.map((user, index) => (
              <article key={`${user.userId}-${index}`} className="ranking-card">
                <div className="ranking-card-header">
                  <div>
                    <span className="ranking-position">#{index + 1}</span>
                    <h3>{user.username}</h3>
                    <p>{user.email}</p>
                  </div>
                  <span className={`status-badge ${user.aprobados >= user.reprobados ? "approved" : "failed"}`}>
                    {user.aprobados >= user.reprobados ? "Aprobado" : "Reprobado"}
                  </span>
                </div>

                <div className="stat-grid">
                  <div>
                    <p className="stat-label">Exámenes</p>
                    <strong>{user.totalExamenes}</strong>
                  </div>
                  <div>
                    <p className="stat-label">Aprobados</p>
                    <strong>{user.aprobados}</strong>
                  </div>
                  <div>
                    <p className="stat-label">Reprobados</p>
                    <strong>{user.reprobados}</strong>
                  </div>
                  <div>
                    <p className="stat-label">Promedio</p>
                    <strong>{user.promedioPorcentaje}%</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID Evaluación</th>
              <th>Usuario</th>
              <th>Email</th>
              <th>Aciertos</th>
              <th>Total</th>
              <th>Porcentaje</th>
              <th>Subtemas dominados</th>
              <th>Subtemas por mejorar</th>
              <th>Fecha</th>
            </tr>
          </thead>

          <tbody>
            {evaluaciones.map((e) => {
              const userId = e.userId?._id ?? e.userId;
              const key = userId?.toString() || e.username || e.email;
              const temas = temasPorAlumno[key] || { topDominados: [], menosDominados: [] };

              return (
                <tr key={e._id}>
                  <td>{e._id}</td>
                  <td>{e.username}</td>
                  <td>{e.email}</td>
                  <td>{e.resultadoFinal?.aciertos ?? 0}</td>
                  <td>{e.resultadoFinal?.total ?? 0}</td>
                  <td>{e.resultadoFinal?.porcentaje ?? 0}%</td>
                  <td>
                    {temas.topDominados?.length ? (
                      temas.topDominados.map((tema) => (
                        <span key={`dom-${key}-${tema.subarea}`} className="topic-pill dominated">
                          {tema.subarea} ({tema.porcentaje}%)
                        </span>
                      ))
                    ) : (
                      <span className="topic-empty">-</span>
                    )}
                  </td>
                  <td>
                    {temas.menosDominados?.length ? (
                      temas.menosDominados.map((tema) => (
                        <span key={`imp-${key}-${tema.subarea}`} className="topic-pill improve">
                          {tema.subarea} ({tema.porcentaje}%)
                        </span>
                      ))
                    ) : (
                      <span className="topic-empty">-</span>
                    )}
                  </td>
                  <td>{new Date(e.fecha).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AdminPanel;
