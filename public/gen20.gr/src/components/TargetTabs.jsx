import React, { useState } from 'react';

const TargetTabs = ({ tasks, selectedTaskId, onTabSelect, onTargetChange }) => {
    const [editTaskId, setEditTaskId] = useState(null);

    const handleTabDoubleClick = (taskId) => {
        setEditTaskId(taskId); // Set the task ID to enable editing
    };

    const handleInputBlur = () => {
        setEditTaskId(null); // Reset edit mode when input loses focus
    };

    return (
        <div style={{ marginBottom: '20px' }}>
            {tasks.map((task) => (
                <button
                    key={task.id}
                    onClick={() => onTabSelect(task.id)}
                    onDoubleClick={() => handleTabDoubleClick(task.id)}
                    style={{
                        marginRight: '10px',
                        padding: '8px',
                        backgroundColor: task.id === selectedTaskId ? 'lightblue' : 'white',
                        border: '1px solid black',
                        cursor: 'pointer'
                    }}
                >
                    {task.target_name}
                    <br />
                    {editTaskId === task.id ? (
                        <input
                            type="text"
                            value={task.target_name || ''}
                            onChange={(e) => onTargetChange(task.id, e.target.value)}
                            onBlur={handleInputBlur}
                            style={{ marginTop: '5px', width: '80px' }}
                            placeholder="Target"
                            autoFocus
                        />
                    ) : null}
                </button>
            ))}
        </div>
    );
};

export default TargetTabs;
