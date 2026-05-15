/**
 * MyRuta Web - Footer Component
 * 
 * Responsibilities:
 * - Display footer information with dark/neon theme
 * - Show app version and links
 */

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark-800 border-t-2 border-neon-500 mt-12" style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-neon-500 font-bold mb-4" style={{ textShadow: '0 0 10px rgba(0, 255, 65, 0.6)' }}>
              🚀 MyRuta
            </h3>
            <p className="text-neon-500 opacity-75 text-sm">
              Sistema integral de monitoreo de transporte público urbano con tecnología AI.
            </p>
          </div>

          <div>
            <h4 className="text-neon-500 font-semibold mb-4">Enlaces</h4>
            <ul className="text-sm space-y-2">
              <li><a href="#" className="text-neon-500 opacity-75 hover:opacity-100 transition">📖 Documentación</a></li>
              <li><a href="#" className="text-neon-500 opacity-75 hover:opacity-100 transition">💬 Soporte</a></li>
              <li><a href="#" className="text-neon-500 opacity-75 hover:opacity-100 transition">🔒 Privacidad</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-neon-500 font-semibold mb-4">Contacto</h4>
            <p className="text-neon-500 opacity-75 text-sm">
              📧 info@myruta.com<br />
              📞 +58 123 456 7890
            </p>
          </div>
        </div>

        <div className="border-t border-neon-500 border-opacity-30 mt-8 pt-8 text-center text-sm">
          <p className="text-neon-500 opacity-75">
            © {currentYear} MyRuta. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
