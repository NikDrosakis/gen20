import React from 'react';

const CompleteCheck = ({ checked, onChange }) => {
    return (
        <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            style={{ marginLeft: '10px' }}
        />
    );
};

export default CompleteCheck;
