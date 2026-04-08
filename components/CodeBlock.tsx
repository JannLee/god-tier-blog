'use client'

import { useRef, useState } from 'react'

export default function CodeBlock({
  children,
  ...props
}: React.HTMLAttributes<HTMLPreElement>) {
  const preRef = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const code = preRef.current?.querySelector('code')
    if (!code) return
    navigator.clipboard.writeText(code.innerText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const childProps = (children as React.ReactElement<Record<string, unknown>>)?.props
  const lang = (childProps?.['data-language'] as string) ?? ''

  // Forward data-theme to the wrapper so CSS can toggle light/dark code themes
  const { 'data-theme': dataTheme, ...preProps } = props as typeof props & { 'data-theme'?: string }

  return (
    <div
      className="code-block relative group my-4"
      {...(dataTheme ? { 'data-theme': dataTheme } : {})}
    >
      <pre ref={preRef} {...preProps} className="rounded-xl overflow-x-auto">
        {children}
      </pre>
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {lang && (
          <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/60">
            {lang}
          </span>
        )}
        <button
          onClick={handleCopy}
          className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
          aria-label="코드 복사"
        >
          {copied ? '✓ 복사됨' : '복사'}
        </button>
      </div>
    </div>
  )
}
