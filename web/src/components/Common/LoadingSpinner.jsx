/**
 * MyRuta Web - Loading Spinner Component
 * 
 * Responsibilities:
 * - Display loading indicator with dark/neon theme
 */

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div 
        className="animate-spin rounded-full h-12 w-12 border-4 border-neon-500 border-opacity-30 border-t-neon-500"
        style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.6)' }}
      ></div>
    </div>
  )
}
