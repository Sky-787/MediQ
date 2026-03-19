import React from 'react';
// Eliminamos la importación de Inbox ya que no se usa directamente

const EmptyState = ({ 
  icon: Icon, 
  title = 'No hay datos disponibles', 
  description = 'No se encontraron elementos para mostrar en esta sección.',
  ctaText,
  onCta 
}) => {
  // Si no se proporciona un icono, usamos un div vacío o podrías poner un icono por defecto
  // Opción 1: No mostrar icono si no se proporciona
  const showIcon = !!Icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {showIcon && (
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <Icon className="w-12 h-12 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm mb-6">{description}</p>
      {ctaText && onCta && (
        <button
          onClick={onCta}
          className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors font-medium"
        >
          {ctaText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;