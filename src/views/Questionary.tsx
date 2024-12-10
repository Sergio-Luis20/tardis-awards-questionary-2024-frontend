import React, { useEffect, useRef, useState } from 'react';
import Select from 'react-select';
import api from '../Api';
import ErrorPage from '../fragments/ErrorPage';
import MemberElement from '../fragments/MemberElement';
import { Member } from '../Member';
import { Question } from '../Question';
import '../styles/Questionary.css';
import { User } from '../User';

type QuestionAnswer = {
  questionId: number,
  membersIds: string[]
}

type Answer = {
  discordId: string,
  answers: QuestionAnswer[]
}

const Questionary : React.FC = () => {
  try {
    const user = JSON.parse(sessionStorage.getItem('user')!) as User

    if (user.voted) {
      return (
        <>
          <h1>Você já votou, {user.name}</h1>
          <h3>Aguarde a apuração dos resultados no dia do evento.</h3>
        </>
      )
    }

    const members = JSON.parse(sessionStorage.getItem('members')!) as Member[]
    const questions = JSON.parse(sessionStorage.getItem('questions')!) as Question[]
    return <EffectiveQuestionary members={members} questions={questions} user={user} />
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      const message = (error as { message: string }).message
      return <ErrorPage message={message} />
    }
    return <ErrorPage message='Erro ao tentar obter os dados do questionário' />
  }
}

function EffectiveQuestionary({members, questions, user}: {members: Member[], questions: Question[], 
  user: User}) {
    
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false)
  const [error, setError] = useState<string>()
  const [showPosted, setShowPosted] = useState<boolean>(false)

  const answers: QuestionAnswer[] = []

  const setQuestionAnswer = (answer: QuestionAnswer) => {
    answers[answer.questionId] = answer
  }

  const answer: Answer = {
    discordId: user.discordId,
    answers: answers
  }

  const elements: JSX.Element[] = []

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i]
    let element
    if (question.options) {
      element = <MemberRadio members={question.options} question={question} setAnswer={setQuestionAnswer} key={i} />
    } else {
      element = <MemberOption members={members} question={question} setAnswer={setQuestionAnswer} key={i} />
    }
    elements.push(element)
  }

  function catchError(error: any) {
    if (error && typeof error === 'object' && 'message' in error) {
      setError((error as { message: string }).message)
    } else {
      setError('Erro durante o envio da resposta')
    }
    setTimeout(() => {
      setError(undefined)
      setButtonDisabled(false)
    }, 10000) // 10 seconds
  }

  useEffect(() => {
    if (error || showPosted) {
      window.scrollTo(0, document.body.scrollHeight)
    }
  }, [error, showPosted])

  const send = () => {
    setButtonDisabled(true)
    try {
      for (const answer of answers) {
        for (const memberId of answer.membersIds) {
          if (!memberId) {
            setError('Preencha todas as questões antes de enviar sua resposta')
            setTimeout(() => {
              setError(undefined)
              setButtonDisabled(false)
            }, 10000) // 10 seconds
            return
          }
        }
        const idsAmount = questions[answer.questionId].numAnswers
        if (new Set(answer.membersIds).size !== idsAmount) {
          setError('Não repita as mesmas opções para questões de múltipla escolha')
          setTimeout(() => {
            setError(undefined)
            setButtonDisabled(false)
          }, 10000) // 10 seconds
          return
        }
      }
      
      api.post('/question/answer', answer).then(response => {
        if (response.status === 201) {
          setShowPosted(true)
          return
        } else if (response.status === 409) {
          setError('Você já enviou sua resposta!')
        } else {
          const message = response.data ? response.data : 'Erro ao enviar resposta do questionário'
          setError(`${response.status} ${response.statusText}: ${message}`)
        }
        setTimeout(() => setError(undefined), 10000) // 10 seconds
        if (!showPosted) {
          setButtonDisabled(false)
        }
      }).catch(error => catchError(error))
    } catch (error) {
      catchError(error)
    }
  }

  return (
    <>
      <div className='questionary'>
        <div className='presentation'>
          <p>Respondendo questionário como</p>
          <MemberElement member={user} className='user' />
        </div>
        <div className='elements'>{elements}</div>
        <button onClick={send} disabled={buttonDisabled}>Enviar resposta</button>
        {error && <p className='sep'>{error}</p>}
        {showPosted && <p className='posted'>Resposta enviada com êxito! Aguarde o dia do evento para saber os resultados.</p>}
      </div>
    </>
  )
}

function MemberRadio({members, question, setAnswer}: {members: Member[], question: Question, 
  setAnswer: (answer: QuestionAnswer) => void}) {

  const [current, setCurrent] = useState<QuestionAnswer>({
    questionId: question.id,
    membersIds: ['']
  })

  setAnswer(current)

  function getId(member: Member) {
    return member.second ? `${member.discordId}_${member.second.discordId}` : member.discordId
  }

  const handleChange = (member: Member) => {
    const newAnswer: QuestionAnswer = {
      questionId: current.questionId,
      membersIds: [getId(member)]
    }
    setCurrent(newAnswer)
    setAnswer(newAnswer)
  }

  return (
    <>
      <div className='question'>
        <h4 className='question-text'>{question.question}</h4>
        <div className='labels'>
          {members.map((member, index) => (
            <label key={index} className='member-label'>
              <input 
                type='radio' 
                className='member-radio' 
                value={getId(member)} 
                checked={current.membersIds[0] === getId(member)}
                onChange={() => handleChange(member)}
              />
              <MemberElement member={member} className='white-element' />
            </label>
          ))}
        </div>
      </div>
    </>
  )
}

function MemberOption({members, question, setAnswer}: {members: Member[], question: Question, 
  setAnswer: (answer: QuestionAnswer) => void}) {
  
  const options = members.map(member => ({
    value: member.discordId,
    label: member.name,
    member
  }))

  const answer = useRef<QuestionAnswer>({
    questionId: question.id,
    membersIds: Array(question.numAnswers).fill('')
  })

  setAnswer(answer.current)

  const onSelectChange = (selected: any, index: number) => {
    answer.current.membersIds[index] = selected ? selected.value : ''
    setAnswer(answer.current)
  }

  const elements: JSX.Element[] = []

  for (let i = 0; i < question.numAnswers; i++) {
    const select = <Select 
      key={i}
      className='member-select' 
      options={options} 
      formatOptionLabel={option => <MemberElement member={option.member} />}
      onChange={selected => onSelectChange(selected, i)} 
      placeholder='Selecione...' 
    />
    elements.push(select)
  }

  return (
    <>
      <div className='question'>
        <h4 className='question-text'>{question.question}</h4>
        <div className='options'>{elements}</div>
      </div>
    </>
  )
}

export default Questionary;