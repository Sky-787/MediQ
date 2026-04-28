// src/components/ui/Skeleton.jsx

/**
 * Skeleton — bloque de placeholder animado para estados de carga.
 *
 * Props:
 *  - className : clases Tailwind adicionales (ancho, alto, forma, etc.)
 *
 * Uso básico:
 *   <Skeleton className="h-6 w-48 rounded" />
 *
 * Uso compuesto (tarjeta):
 *   <SkeletonCard />
 */

export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

/** Tarjeta skeleton genérica — imita el layout de una AppointmentCard / DoctorCard */
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
      </div>
      <Skeleton className="h-8" />
    </div>
  );
}

export default Skeleton;
