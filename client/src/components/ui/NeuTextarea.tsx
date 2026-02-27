import type { TextareaHTMLAttributes } from 'react'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export default function NeuTextarea({ className = '', ...props }: TextareaProps) {
  return (
    <textarea
      className={`border-2 border-b-4 border-black bg-white p-2 focus:outline-none ${className}`.trim()}
      {...props}
    />
  )
}
