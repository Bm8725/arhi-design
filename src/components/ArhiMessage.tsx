// src/components/ArhiMessage.tsx
// Randare ușoară și sigură a răspunsurilor AI: **bold**, `cod`, liste, titluri, linkuri https.
// Nu folosește dangerouslySetInnerHTML, deci nu poate injecta HTML.

import React from 'react'

type Block =
  | { type: 'p'; text: string }
  | { type: 'h'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }

const INLINE = /(\*\*[^*\n]+\*\*|`[^`\n]+`|https?:\/\/[^\s)]+)/g

function renderInline(text: string): React.ReactNode[] {
  return text
    .split(INLINE)
    .filter(Boolean)
    .map((part, i) => {
      if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      if (part.length > 2 && part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1 py-0.5 rounded bg-black/[0.06] text-[0.92em]">
            {part.slice(1, -1)}
          </code>
        )
      }
      if (/^https?:\/\//.test(part)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 break-all"
          >
            {part}
          </a>
        )
      }
      return part
    })
}

function parse(content: string): Block[] {
  const blocks: Block[] = []
  for (const raw of content.split('\n')) {
    const line = raw.trimEnd()
    if (line.trim() === '') continue

    const li = line.match(/^\s*(?:([-*•])|(\d+)[.)])\s+(.*)$/)
    if (li) {
      const ordered = !!li[2]
      const last = blocks[blocks.length - 1]
      if (last && last.type === 'list' && last.ordered === ordered) last.items.push(li[3])
      else blocks.push({ type: 'list', ordered, items: [li[3]] })
      continue
    }

    const h = line.match(/^#{1,4}\s+(.*)$/)
    if (h) {
      blocks.push({ type: 'h', text: h[1] })
      continue
    }

    blocks.push({ type: 'p', text: line })
  }
  return blocks
}

export default function ArhiMessage({ content }: { content: string }) {
  const blocks = parse(content)
  return (
    <div className="space-y-1.5 break-words">
      {blocks.map((b, i) => {
        if (b.type === 'h') {
          return (
            <p key={i} className="font-semibold">
              {renderInline(b.text)}
            </p>
          )
        }
        if (b.type === 'list') {
          const Tag = b.ordered ? 'ol' : 'ul'
          return (
            <Tag key={i} className={`pl-5 space-y-1 ${b.ordered ? 'list-decimal' : 'list-disc'}`}>
              {b.items.map((it, j) => (
                <li key={j}>{renderInline(it)}</li>
              ))}
            </Tag>
          )
        }
        return <p key={i}>{renderInline(b.text)}</p>
      })}
    </div>
  )
}