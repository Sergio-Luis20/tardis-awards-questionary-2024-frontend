import { useNavigate } from "react-router-dom"
import '../styles/AdminPage.css'

const AdminPage : React.FC = () => {
  const navigate = useNavigate()

  const questionary = () => {
    navigate('/questionary')
  }

  const viewResults = () => {
    navigate('/results')
  }

  return (
    <>
      <div className="admin-page">
        <h1>Área administrativa</h1>
        <button onClick={questionary}>Responder questionário</button>
        <button onClick={viewResults}>Ver resultados</button>
      </div>
    </>
  )
}

export default AdminPage