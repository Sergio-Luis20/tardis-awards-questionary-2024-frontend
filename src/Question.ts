import { Member } from "./Member"

export interface Question {
  id: number
  question: string
  numAnswers: number
  options?: Member[] | null
}