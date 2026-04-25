/**
 * MyRuta Web - Card Component
 * 
 * Responsibilities:
 * - Reusable card container with dark/neon theme
 */

export default function Card({ children, className = '' }) {
  return (
    <div 
      className={`bg-dark-800 border-2 border-neon-500 rounded-xl p-6 ${className}`}
      style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}
    >
      {children}
    </div>
  )
}
