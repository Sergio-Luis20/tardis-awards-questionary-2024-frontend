import { Member } from "../Member"
import '../styles/MemberElement.css'

const MemberElement = ({member, className}: {member: Member, className?: string}) => {
  return (
    <>
      <div className={'member' + (className ? ' ' + className : '')}>
        <img src={member.avatarUrl} alt='' />
        {getDisplayName(member)}
        {member.second && (
          <>
            <img src={member.second.avatarUrl} alt='' />
            {getDisplayName(member.second)}
          </>
        )}
      </div>
    </>
  )
}

function getDisplayName(member: Member): string {
  let displayName = member.name

  if (member.note) {
    displayName += ` (${member.note})`
  }

  return displayName
}

export default MemberElement