import { type ReactNode } from 'react'

function parseInlineTokens(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g
  let lastIdx = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.slice(lastIdx, match.index))
    }
    const token = match[0]
    const key = `${lastIdx}-${match.index}`
    if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
      parts.push(<strong key={key}>{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
      parts.push(<em key={key}>{token.slice(1, -1)}</em>)
    } else if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
      parts.push(<code key={key}>{token.slice(1, -1)}</code>)
    } else {
      parts.push(token)
    }
    lastIdx = regex.lastIndex
  }

  if (lastIdx < text.length) {
    parts.push(text.slice(lastIdx))
  }

  return parts
}

interface BlockUl {
  type: 'ul'
  items: string[]
}

interface BlockOl {
  type: 'ol'
  items: string[]
}

interface BlockH2 {
  type: 'h2'
  text: string
}

interface BlockH3 {
  type: 'h3'
  text: string
}

interface BlockHr {
  type: 'hr'
}

interface BlockP {
  type: 'p'
  text: string
}

type ContentBlock = BlockUl | BlockOl | BlockH2 | BlockH3 | BlockHr | BlockP

export function FormattedChatText({ content }: { content: string }) {
  if (!content) return null

  // Fast path for short single-line text without markdown
  if (!content.includes('\n') && !content.includes('*') && !content.includes('#') && !content.includes('---')) {
    return <p className="chat-text-paragraph">{content}</p>
  }

  const lines = content.split('\n')
  const blocks: ContentBlock[] = []
  let currentList: BlockUl | BlockOl | null = null

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]
    const trimmed = rawLine.trim()

    if (!trimmed) {
      if (currentList) {
        blocks.push(currentList)
        currentList = null
      }
      continue
    }

    if (trimmed === '---' || trimmed === '***') {
      if (currentList) {
        blocks.push(currentList)
        currentList = null
      }
      blocks.push({ type: 'hr' })
      continue
    }

    if (trimmed.startsWith('### ')) {
      if (currentList) {
        blocks.push(currentList)
        currentList = null
      }
      blocks.push({ type: 'h3', text: trimmed.slice(4) })
      continue
    }

    if (trimmed.startsWith('## ')) {
      if (currentList) {
        blocks.push(currentList)
        currentList = null
      }
      blocks.push({ type: 'h2', text: trimmed.slice(3) })
      continue
    }

    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/)
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'ul') {
        if (currentList) blocks.push(currentList)
        currentList = { type: 'ul', items: [] }
      }
      currentList.items.push(bulletMatch[1])
      continue
    }

    const numMatch = trimmed.match(/^\d+\.\s+(.*)$/)
    if (numMatch) {
      if (!currentList || currentList.type !== 'ol') {
        if (currentList) blocks.push(currentList)
        currentList = { type: 'ol', items: [] }
      }
      currentList.items.push(numMatch[1])
      continue
    }

    if (currentList) {
      blocks.push(currentList)
      currentList = null
    }

    blocks.push({ type: 'p', text: trimmed })
  }

  if (currentList) {
    blocks.push(currentList)
  }

  return (
    <div className="chat-formatted-body">
      {blocks.map((block, idx) => {
        if (block.type === 'hr') {
          return <hr key={idx} className="chat-divider-line" />
        }
        if (block.type === 'h2') {
          return <h4 key={idx} className="chat-heading-h2">{parseInlineTokens(block.text)}</h4>
        }
        if (block.type === 'h3') {
          return <h5 key={idx} className="chat-heading-h3">{parseInlineTokens(block.text)}</h5>
        }
        if (block.type === 'ul') {
          return (
            <ul key={idx} className="chat-list-ul">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx}>{parseInlineTokens(item)}</li>
              ))}
            </ul>
          )
        }
        if (block.type === 'ol') {
          return (
            <ol key={idx} className="chat-list-ol">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx}>{parseInlineTokens(item)}</li>
              ))}
            </ol>
          )
        }
        return (
          <p key={idx} className="chat-text-paragraph">
            {parseInlineTokens(block.text)}
          </p>
        )
      })}
    </div>
  )
}
