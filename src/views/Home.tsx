import '../styles/Home.css'

const Home : React.FC = () => {
  const verify = () => {
    window.location.href = import.meta.env.VITE_API_URL + '/oauth2/authorization/discord'
  }
  
  const credits = 'https://github.com/Sergio-Luis20'
  return (
    <>
      <div className='home-page'>
        <div className='md'>
          <h1>TARDIS Awards 2024</h1>
          <h3>Entre para responder ao questionário</h3>
          <button className='login-with-discord' onClick={verify}>
            <img src='/images/discord-logo.webp' alt='' />
            Entrar com Discord
          </button>
        </div>
        <footer>
          <a href={credits} target='_blank' rel='noopener noreferrer'>{credits}</a>
        </footer>
      </div>
    </>
  )
}

export default Home;