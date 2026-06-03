import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    
    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 border-transparent",
      secondary: "bg-[#27272a] text-white hover:bg-[#3f3f46] focus:ring-zinc-500 border-white/10",
      ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 border-transparent",
      danger: "bg-red-600/10 text-red-500 hover:bg-red-600/20 focus:ring-red-500 border-red-500/20",
    }

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 py-2 text-sm",
      lg: "h-12 px-6 py-3 text-base",
    }

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-lg border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0b] disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className || ''}`}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
