import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export default function NeuInput({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`border-2 border-black p-2 bg-white dark:bg-zinc-800 dark:text-white dark:border-zinc-400 dark:placeholder-zinc-500 transition-all ${className}`.trim()}
      {...props}
    />
  )
}
