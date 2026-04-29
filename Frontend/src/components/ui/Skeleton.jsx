// src/components/ui/Skeleton.jsx

export function Skeleton({ className = '', variant = 'text' }) {
  const variants = {
    text:   'h-4 w-full rounded',
    title:  'h-6 w-3/4 rounded',
    avatar: 'h-10 w-10 rounded-full',
    card:   'h-32 w-full rounded-2xl',
    button: 'h-9 w-24 rounded-xl',
  };

  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${variants[variant]} ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 flex flex-col gap-3">
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