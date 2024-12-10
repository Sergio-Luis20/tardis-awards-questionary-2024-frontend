import { useNavigate } from "react-router-dom"
import '../styles/ErrorPage.css'

interface Message {
  message: string
}

const ErrorPage : React.FC<Message> = ({message}) => {
  const navigate = useNavigate()
  const returnToLoginPage = () => {
    navigate('/')
  }
  return (
    <>
      <h1 className="error-message">{message}</h1>
      <button onClick={returnToLoginPage} className="return-to-home">Retornar à página inicial</button>
    </>
  )
}

export default ErrorPage