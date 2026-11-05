// components/CuboCard.jsx
import React from 'react';
import CuboFileItem from './CuboFileItem';

const CuboCard = ({
                      cubo,
                      isExpanded,
                      isDropTarget,
                      onToggle,
                      onDragOver,
                      onDragLeave,
                      onDrop,
                      onContextMenu,
                      // files
                      files = [],
                      highlighted = {},
                      selected = null,
                      draggedPath = null,
                      onFileClick,
                      onFileDoubleClick,
                      onFileDragStart,
                      onFileDragEnd,
                      onFileContextMenu,
                  }) => {
    const color = cubo.color || '#808080';

    return (
        <div
            className={`domain-card ${isDropTarget ? 'drop-target' : ''}`}
            style={{
                borderTop: `4px solid ${color}`,
                outline: isDropTarget ? `2px dashed ${color}` : undefined,
            }}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onContextMenu={onContextMenu}
        >
            <div
                className="domain-header"
                onClick={onToggle}
                style={{ cursor: 'pointer' }}
            >
                <span className="arrow-icon">{isExpanded ? '▼' : '▶'}</span>
                <span style={{
                    display: 'inline-block', width: 12, height: 12,
                    borderRadius: 3, background: color, marginRight: 6,
                }} />
                <h3 style={{ margin: 0 }}>{cubo.name}</h3>
                {cubo.title && cubo.title !== cubo.name && (
                    <span style={{
                        fontSize: 11, color: '#64748b', marginLeft: 8,
                        fontWeight: 400,
                    }}>— {cubo.title}</span>
                )}
                <span style={{
                    marginLeft: 'auto', fontSize: 11, color: '#475569',
                    background: '#f1f5f9', padding: '2px 8px', borderRadius: 10,
                }}>
                    {cubo.files_count} files · {cubo.domains_count} domains
                </span>
            </div>

            {cubo.version && (
                <div className="domain-path">
                    📁 cubos/{cubo.folder}/{cubo.version}
                </div>
            )}

            {isExpanded && (
                <div className="tree-children">
                    {files.length === 0 ? (
                        <div style={{ fontSize: 11, color: '#94a3b8', padding: '6px 12px' }}>
                            (κενό — σύρε αρχεία εδώ)
                        </div>
                    ) : (
                        files.map(file => (
                            <CuboFileItem
                                key={`${file.domain}::${file.path}`}
                                file={file}
                                cuboColor={color}
                                highlighted={!!highlighted[file.path]}
                                selected={selected?.path === file.path}
                                dragging={draggedPath === file.path}
                                onClick={onFileClick}
                                onDoubleClick={onFileDoubleClick}
                                onDragStart={onFileDragStart}
                                onDragEnd={onFileDragEnd}
                                onContextMenu={onFileContextMenu}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default CuboCard;