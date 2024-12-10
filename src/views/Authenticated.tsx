import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import api from "../Api"
import ErrorPage from "../fragments/ErrorPage"
import { Question } from "../Question"
import { User } from "../User"
import { Member } from "../Member"

const Authenticated : React.FC = () => {
  const [view, setView] = useState(
    <>
      <h1>Carregando...</h1>
    </>
  )
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)

  sessionStorage.removeItem('token')
  const token = queryParams.get('token')

  useEffect(() => {
    if (!token) {
      setView(<ErrorPage message="Token inexistente. Retorne à página inicial e tente fazer login novamente." />)
    } else {
      const setup = async () => {
        try {
          const headers = {
            'Authorization': `Bearer ${token}`
          }
          // User setup
          const userResponse = await api.get('/user/me', {headers})
          const questionsResponse = await api.get('/question/questions', {headers})
          const membersResponse = await api.get('/user/discord-members', {headers})
          if (userResponse.status === 200 && questionsResponse.status === 200 && membersResponse.status === 200) {
            const user = userResponse.data as User
            const questions = questionsResponse.data as Question[]
            const members = membersResponse.data as Member[]
            sessionStorage.setItem('token', token)
            sessionStorage.setItem('user', JSON.stringify(user))
            sessionStorage.setItem('questions', JSON.stringify(questions))
            sessionStorage.setItem('members', JSON.stringify(members))
            navigate(user.admin ? '/admin' : '/questionary')
          } else if (userResponse.status === 401) {
            const message = `${userResponse.status} ${userResponse.statusText}: ${userResponse.data ? userResponse.data : 'Token inválido. Retorne à página inicial e tente fazer login novamente.'}`
            setView(<ErrorPage message={message} />)
          } else {
            const message = `${userResponse.status} ${userResponse.statusText}: ${userResponse.data ? userResponse.data : 'Não foi possível concluir a autenticação.'}`
            setView(<ErrorPage message={message} />)
          }
        } catch (error) {
          if (error && typeof error === 'object' && 'message' in error) {
            const message = (error as { message: string }).message
            setView(<ErrorPage message={message} />)
          } else {
            setView(<ErrorPage message={`Erro: ${error}`} />)
          }
        }
      }
  
      setup()
    }
  }, [token, navigate])

  return view
}

export default Authenticated