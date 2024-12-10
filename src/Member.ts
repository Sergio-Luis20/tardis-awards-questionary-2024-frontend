export interface Member {
  discordId: string,
  name: string,
  avatarUrl: string
  note?: string | null
  second?: Member | null
}