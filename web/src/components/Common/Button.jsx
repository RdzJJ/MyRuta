/**
 * MyRuta Web - Button Component
 * 
 * Responsibilities:
 * - Reusable button with variants (dark/neon themed)
 */

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}) {
  const baseClass = 'font-semibold rounded-lg transition duration-200 transform hover:scale-105'
  
  const variants = {
    primary: 'bg-gradient-to-r from-neon-500 to-neon-600 text-dark-900 hover:from-neon-400 hover:to-neon-500',
    secondary: 'bg-dark-700 text-neon-500 border-2 border-neon-500 hover:bg-dark-600',
    danger: 'border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-dark-900',
    outline: 'border-2 border-neon-500 text-neon-500 hover:bg-neon-500 hover:text-dark-900'
  }

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }

  const getBoxShadow = () => {
    if (variant === 'primary') {
      return { boxShadow: '0 0 15px rgba(0, 255, 65, 0.5)' }
    }
    return {}
  }

  return (
    <button 
      className={`${baseClass} ${variants[variant]} ${sizes[size]} ${className}`}
      style={getBoxShadow()}
      {...props}
    >
      {children}
    </button>
  )
}
