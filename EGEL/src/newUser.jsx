import { useState, useEffect } from 'react'
import './App.css'

function NewUser({ onBack }) {
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
    <div className="center">
      <h1>Nuevo usuario</h1>

      <label htmlFor="dato">Ingrese su correo</label>
      <input
        id="dato"
        type="email"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && agregarDato()}
        placeholder="Escribe tu correo..."
      />

      <label htmlFor="dato">Ingrese su contraseña</label>
      <input
        id="dato"
        type="password"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && agregarDato()}
        placeholder="Escribe tu contraseña..."
      />

      <label htmlFor="dato">Confirme su contraseña</label>
      <input
        id="dato"
        type="password"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && agregarDato()}
        placeholder="Escribe tu contraseña..."
      />

      <div className="actions">
        <button type="button" className="btn" onClick={agregarDato}>
          Registrarse
        </button>
      </div>

      <p className="link-text" onClick={onBack}>
        Volver al inicio
      </p>
    </div>
  )
}

export default NewUser
