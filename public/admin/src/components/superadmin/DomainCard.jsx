// components/superadmin/DomainCard.jsx
import React from 'react';

export default function DomainCard({
                                       domain,
                                       nodePath,
                                       isExpanded,
                                       isDropTarget,
                                       onToggle,
                                       onDragOver,
                                       onDragLeave,
                                       onDrop,
                                       onContextMenu,
                                       children,
                                   }) {
    return (
        <div
            className="domain-card"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onContextMenu={onContextMenu}
        >
            <div className="domain-header" onClick={onToggle}>
                <span className="arrow-icon">{isExpanded ? '▼' : '▶'}</span>
                <h3>{domain}</h3>
            </div>
            <div className="domain-path">{nodePath}/src</div>
            {isExpanded && children}
        </div>
    );
}