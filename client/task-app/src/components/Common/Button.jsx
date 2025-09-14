// Button.js (reusable component in a separate file)
import React from 'react';

const Button = ({ text, onClick }) => {
    return (
        <button
            onClick={onClick}
            style={{
                backgroundColor: '#B2F2BB',
                color: '#333',
                padding: '10px 20px',
                borderRadius: '20px',
                border: 'none',
                fontSize: '14px',
                cursor: 'pointer',
                width: '100%',
                fontWeight: 'bold',
            }}
        >
            {text}
        </button>
    );
};

export default Button;