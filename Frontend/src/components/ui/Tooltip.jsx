import { useState } from 'react';

const Tooltip = ({ text, children, position = 'top' }) => {
  const [visible, setVisible] = useState(false);
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };
  return (
    <div className="relative inline-flex" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      {children}
      {visible && (
        <div className={`absolute z-50 px-2 py-1 text-xs rounded-md whitespace-nowrap bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900 ${positionClasses[position]}`}>
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
