/*
#name: TestComponent
#title: Test Component for Layout
#description: Just a test for Layout development
#author: Niki Mourtzi
#version: 1.0.0
#type: function
#library: layout
#dependencies: react, react-router-dom
*/
import React from 'react';

const TestComponent = ({ title = 'Test Component', message = 'Hello from TestComponent!' }) => {
    return (
        <div style={{
            padding: '20px',
            margin: '10px 0',
            background: '#d4edda',
            border: '2px solid #28a745',
            borderRadius: '8px',
            color: '#155724'
        }}>
            <h2>✅ {title}</h2>
            <p>{message}</p>
            <p style={{ fontSize: '12px', color: '#666' }}>
                Component loaded successfully at {new Date().toLocaleTimeString()}
            </p>
        </div>
    );
};

export default TestComponent;