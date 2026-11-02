import type { ReactNode } from "react"

// Renders WhatsApp formatting markup the way the WhatsApp app shows it:
// *bold*, _italic_, ~strike~, `inline code`, ```monospace```, "> " quotes,
// "- " / "* " bullets, "1. " numbered lists and @mentions.

const INLINE = /(```[^`]+```|`[^`]+`|\*[^*\n]+\*|_[^_\n]+_|~[^~\n]+~|@(?:all|[A-Z][a-z]+(?: [A-Z][a-z]+)?))/g

function inline(text: string, key: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    const k = `${key}-${i}`
    if (part.startsWith("```") && part.endsWith("```") && part.length > 6) return <code key={k} className="font-mono text-[12px] bg-black/10 rounded px-1">{part.slice(3, -3)}</code>
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) return <code key={k} className="font-mono text-[12px] bg-black/10 rounded px-1">{part.slice(1, -1)}</code>
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) return <strong key={k}>{part.slice(1, -1)}</strong>
    if (part.startsWith("_") && part.endsWith("_") && part.length > 2) return <em key={k}>{part.slice(1, -1)}</em>
    if (part.startsWith("~") && part.endsWith("~") && part.length > 2) return <s key={k}>{part.slice(1, -1)}</s>
    if (part.startsWith("@")) return <span key={k} className="font-semibold underline decoration-dotted">{part}</span>
    return part
  })
}

export function WaText({ text }: { text: string }) {
  const lines = text.split("\n")
  return (
    <div className="text-sm leading-relaxed space-y-0.5">
      {lines.map((line, i) => {
        const key = `l${i}`
        if (line.startsWith("> ")) return <div key={key} className="border-l-2 border-current/40 pl-2 opacity-80">{inline(line.slice(2), key)}</div>
        if (/^[-*] /.test(line)) return <div key={key} className="flex gap-1.5"><span>•</span><span>{inline(line.slice(2), key)}</span></div>
        const num = line.match(/^(\d+)\. (.*)$/)
        if (num) return <div key={key} className="flex gap-1.5"><span>{num[1]}.</span><span>{inline(num[2], key)}</span></div>
        if (!line) return <div key={key} className="h-2" />
        return <p key={key}>{inline(line, key)}</p>
      })}
    </div>
  )
}
