// components/superadmin/FolderTreeNode.jsx
import React from 'react';

export default function FolderTreeNode({
                                           name,
                                           level,
                                           isExpanded,
                                           isDropTarget,
                                           onClick,
                                           onDragOver,
                                           onDragLeave,
                                           onDrop,
                                           onContextMenu,
                                           children,
                                       }) {
    return (
        <>
            <div
                className={`tree-folder ${isDropTarget ? 'drop-target' : ''}`}
                style={{ paddingLeft: `${level * 16}px` }}
                onClick={onClick}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onContextMenu={onContextMenu}
            >
                <span className="arrow-icon">{isExpanded ? '▼' : '▶'}</span>
                <span className="folder-icon">📁</span>
                <span className="folder-name">{name}</span>
            </div>
            {isExpanded && children}
        </>
    );
}