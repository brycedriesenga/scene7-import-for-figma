import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
    return (
        <button
            className="w-full bg-yellow-300 hover:bg-yellow-400 disabled:bg-zinc-200 dark:disabled:bg-zinc-700 disabled:text-zinc-500 dark:disabled:text-zinc-400 disabled:cursor-not-allowed text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75"
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;