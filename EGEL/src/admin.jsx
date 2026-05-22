import { useEffect, useState } from "react";
import "./admin.css";

function AdminPanel({ onBack }) {
  const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

  const [evaluaciones, setEvaluaciones] = useState([]);
  const [notAuthorized, setNotAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEvaluaciones();
  }, []);

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
              <th>Fecha</th>
            </tr>
          </thead>

          <tbody>
            {evaluaciones.map((e) => (
              <tr key={e._id}>
                <td>{e._id}</td>
                <td>{e.username}</td>
                <td>{e.email}</td>
                <td>{e.resultadoFinal?.aciertos ?? 0}</td>
                <td>{e.resultadoFinal?.total ?? 0}</td>
                <td>{e.resultadoFinal?.porcentaje ?? 0}%</td>
                <td>{new Date(e.fecha).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AdminPanel;
