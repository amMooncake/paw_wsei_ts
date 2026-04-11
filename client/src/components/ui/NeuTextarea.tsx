import type { TextareaHTMLAttributes } from 'react'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export default function NeuTextarea({ className = '', ...props }: TextareaProps) {
  return (
    <textarea
      className={`border-2 border-black p-2 bg-white dark:bg-zinc-800 dark:text-white dark:border-zinc-400 dark:placeholder-zinc-500 transition-all ${className}`.trim()}
      {...props}
    />
  )
}
