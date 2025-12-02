import React, { useEffect, useRef } from 'react';

const ContextMenu = ({ x, y, onClose, options }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className="fixed z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 min-w-[160px]"
            style={{ top: y, left: x }}
        >
            {options.map((option, index) => (
                <button
                    key={index}
                    onClick={() => {
                        option.onClick();
                        onClose();
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors flex items-center gap-2 ${option.danger ? 'text-red-400 hover:text-red-300' : 'text-gray-300 hover:text-white'
                        }`}
                >
                    {option.icon && <span>{option.icon}</span>}
                    {option.label}
                </button>
            ))}
        </div>
    );
};

export default ContextMenu;
