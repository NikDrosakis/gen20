// components/superadmin/FileTreeNode.jsx
import React from 'react';

export default function FileTreeNode({
                                         name,
                                         domain,
                                         path,
                                         level = 0,
                                         meta = {},
                                         isSelected,
                                         isHighlighted,
                                         isMultiSelected,
                                         isDragging,
                                         onClick,
                                         onDoubleClick,
                                         onDragStart,
                                         onDragEnd,
                                         onContextMenu,
                                         onSearch,
                                     }) {
    const indent = { paddingLeft: `${level * 16 + 8}px` };
    const color = meta?.color || '#808080';

    return (
        <div
            className={[
                'file-node',
                isSelected && 'is-selected',
                isHighlighted && 'is-highlighted',
                isMultiSelected && 'is-multi-selected',
                isDragging && 'is-dragging',
            ].filter(Boolean).join(' ')}
            style={indent}
            draggable
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onContextMenu={onContextMenu}
            title={`${domain}/${path}`}
        >
            <span className="file-node-dot" style={{ background: color }} />
            <span className="file-node-name">{name}</span>
            {meta?.cubos_title && (
                <span className="file-node-cubos">{meta.cubos_title}</span>
            )}
        </div>
    );
}