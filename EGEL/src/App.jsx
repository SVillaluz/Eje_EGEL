import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [datos, setDatos] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [estado, setEstado] = useState('Conectando...')

  const API_URL = 'http://localhost:5000/api'

  // Verificar conexión al servidor
  useEffect(() => {
    const verificarConexion = async () => {
      try {
        const response = await fetch(`${API_URL}/health`)
        const data = await response.json()
        setEstado(data.status)
      } catch (error) {
        setEstado('❌ No se pudo conectar al servidor')
      }
    }

    verificarConexion()
  }, [])

  // Obtener datos de MongoDB
  const obtenerDatos = async () => {
    try {
      const response = await fetch(`${API_URL}/datos`)
      const data = await response.json()
      setDatos(data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Agregar nuevo dato
  const agregarDato = async () => {
    if (!inputValue.trim()) return

    try {
      const response = await fetch(`${API_URL}/datos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: inputValue, fecha: new Date() })
      })
      const data = await response.json()
      setDatos([...datos, data])
      setInputValue('')
    } catch (error) {
      console.error('Error:', error)
    }
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
          <h1>Conexión MongoDB + React</h1>
          <p>Estado: {estado}</p>
        </div>

        {/* Contador */}
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>

        {/* Agregar dato */}
        <div style={{ marginTop: '20px' }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && agregarDato()}
            placeholder="Escribe un nombre..."
            style={{ padding: '8px', marginRight: '10px' }}
          />
          <button onClick={agregarDato} style={{ padding: '8px 15px' }}>
            Agregar
          </button>
          <button onClick={obtenerDatos} style={{ padding: '8px 15px', marginLeft: '10px' }}>
            Obtener datos
          </button>
        </div>

        {/* Mostrar datos */}
        <div style={{ marginTop: '20px', textAlign: 'left' }}>
          <h3>Datos en MongoDB:</h3>
          {datos.length === 0 ? (
            <p>No hay datos</p>
          ) : (
            <ul>
              {datos.map((item, index) => (
                <li key={item._id || index}>
                  {item.nombre} - {new Date(item.fecha).toLocaleString()}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}

export default App
