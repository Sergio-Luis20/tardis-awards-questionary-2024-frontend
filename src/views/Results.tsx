import { useEffect, useState } from 'react'
import api from '../Api'
import { Member } from '../Member'
import { Question } from '../Question'
import ErrorPage from '../fragments/ErrorPage'
import '../styles/Results.css'
import MemberElement from '../fragments/MemberElement'

interface QuestionAnswer {
  questionId: number
  members: Member[]
}

interface Result {
  member: Member
  answers: QuestionAnswer[]
}

interface CombinationResult {
  combination: Member[];
  votes: number;
  percentage: number;
  voters: Member[]
}

interface ProcessedQuestion {
  question: Question;
  totalVotes: number;
  combinations: CombinationResult[];
}

const Results : React.FC = () => {
  const [view, setView] = useState<JSX.Element>(
    <>
      <h1>Carregando...</h1>
    </>
  )

  useEffect(() => {
    const questionsJson = sessionStorage.getItem('questions')
    const questions = JSON.parse(questionsJson!) as Question[]

    const setup = async () => {
      try {
        const response = await api.get('/question/all-answers')
        if (response.status === 200) {
          setView(<ResultsView results={response.data} questions={questions} />)
        } else if (response.status === 403) {
          setView(<ErrorPage message='Você não tem permissão para visualizar esta página' />)
        } else {
          const defaultMessage = 'Não foi possível carregar os resultados da votação'
          const message = `${response.status} ${response.statusText}: ${response.data ? response.data : defaultMessage}`
          setView(<ErrorPage message={message} />)
        }
      } catch (error) {
        let message: string
        if (error && typeof error === 'object' && 'message' in error) {
          message = (error as {message: string}).message
        } else {
          message = 'Não foi possível carregar os resultados da votação'
        }
        setView(<ErrorPage message={message} />)
      }
    }

    setup()
  }, [])

  return view
}

const ResultsView = ({results, questions} : {results: Result[], questions: Question[]}) => {
  const processedQuestions = processResults(results, questions)

  return (
    <>
      <div className='results'>
        {processedQuestions
          .sort((a, b) => a.question.id - b.question.id)
          .map((processedQuestion, index) => <ResultView key={index} processedQuestion={processedQuestion} />)}
      </div>
    </>
  )
}

const ResultView = ({processedQuestion} : {processedQuestion: ProcessedQuestion}) => {
  return (
    <>
      <div className='question-result'>
        <h1>{processedQuestion.question.question}</h1>
        <div className='bars'>
          {processedQuestion.combinations
            .sort((a, b) => b.percentage - a.percentage)
            .map((comb, index) => {
              const combinationElements = comb.combination.map((member, index) => <MemberElement key={index} member={member} className='result-member' />)
              const voteAmount = comb.voters.length
              const votesText = `(${voteAmount} ${voteAmount > 1 ? 'votos' : 'voto'})`
              const percentage = (String(comb.percentage).indexOf('.') === -1 ? comb.percentage + '.0' : comb.percentage) + '%'
              return (
                <div key={index} className='combination'>
                  <div className='combination-elements'>{combinationElements}</div>
                  <p>
                    {`${percentage} ${votesText}`}
                    <VoterList voters={comb.voters} />
                  </p>
                </div>
              )
          })}
        </div>
      </div>
    </>
  )
}

const VoterList = ({voters}: {voters: Member[]}) => {
  return (
    <div className='voter-list'>
      {voters.map((voter, index) => <MemberElement key={index} member={voter} className='result-member' />)}
    </div>
  )
}

function processResults(results: Result[], questions: Question[]): ProcessedQuestion[] {
  return questions.map(question => {
    const questionId = question.id;

    const answersForQuestion: {members: Member[], voter: Member}[] = results
      .flatMap(result => 
          result.answers
            .filter(answer => answer.questionId === questionId)
            .map(answer => ({members: answer.members, voter: result.member}))
      )

    const combinationCounts = new Map<string, { members: Member[], votes: number, voters: Member[] }>();

    answersForQuestion.forEach(({members, voter}) => {
      const sortedMembers = [...members].sort((a, b) => a.discordId.localeCompare(b.discordId));

      const key = JSON.stringify(sortedMembers.map(member => member.discordId));

      if (combinationCounts.has(key)) {
        const combination = combinationCounts.get(key)!
        combination.votes++
        combination.voters.push(voter)
      } else {
        combinationCounts.set(key, { members: sortedMembers, votes: 1, voters: [voter] });
      }
    });

    const totalVotes = answersForQuestion.length;

    const combinations = Array.from(combinationCounts.values()).map(({ members, votes, voters }) => ({
      combination: members,
      votes,
      percentage: Number(((votes / totalVotes) * 100).toFixed(1)), // arredonda a porcentagem de votos para 1 casa decimal
      voters
    }));

    return {
      question,
      totalVotes,
      combinations,
    };
  });
}


export default Results