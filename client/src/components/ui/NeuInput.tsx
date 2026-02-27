import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export default function NeuInput({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`border-2 border-b-4 border-black bg-white p-2 focus:outline-none ${className}`.trim()}
      {...props}
    />
  )
}
