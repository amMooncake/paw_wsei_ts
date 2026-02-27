import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export default function NeuButton({ children, className = '', ...props }: ButtonProps) {
  return (
    <button 
      className={`border-2 border-b-4 border-black text-white p-2 transition active:translate-y-[2px] ${className}`.trim()}
      type="button"
      {...props}
    >
      {children}
    </button>
  )
}
