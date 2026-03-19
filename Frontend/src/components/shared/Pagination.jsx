import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ total, page, limit, onPageChange }) => {
  const totalPages = Math.ceil(total / limit);
  
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        aria-label="Página anterior"
      >
        <ChevLeft className="w-5 h-5" />
      </button>
      
      {getPageNumbers().map((pageNum, index) => (
        <React.Fragment key={index}>
          {pageNum === '...' ? (
            <span className="px-3 py-2 text-gray-500">...</span>
          ) : (
            <button
              onClick={() => onPageChange(pageNum)}
              className={`px-3 py-2 rounded-lg transition-colors ${
                page === pageNum
                  ? 'bg-teal-700 text-white font-medium'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {pageNum}
            </button>
          )}
        </React.Fragment>
      ))}
      
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        aria-label="Página siguiente"
      >
        <ChevRight className="w-5 h-5" />
      </button>
    </div>
  );
};

// Alias para los íconos (evita problemas con nombres)
const ChevLeft = ChevronLeft;
const ChevRight = ChevronRight;

export default Pagination;