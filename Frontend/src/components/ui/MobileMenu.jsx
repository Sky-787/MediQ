import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * MobileMenu — drawer lateral que se abre desde cualquier Navbar.
 *
 * Props:
 *  - isOpen   {boolean}   controla visibilidad
 *  - onClose  {function}  callback para cerrar
 *  - children {ReactNode} contenido del menú (links, botones, etc.)
 */
export default function MobileMenu({ isOpen, onClose, children }) {
  // Bloquear scroll del body mientras el menú está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 shadow-xl flex flex-col"
      >
        {/* Header del drawer */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <span className="text-lg font-bold text-teal-700 dark:text-teal-400">MediQ</span>
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">
          {children}
        </nav>
      </div>
    </>
  );
}
