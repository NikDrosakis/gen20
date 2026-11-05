// components/CuboFileItem.jsx
import React from 'react';

const CuboFileItem = ({
                          file,
                          cuboColor = '#808080',
                          highlighted = false,
                          selected = false,
                          dragging = false,
                          onClick,
                          onDoubleClick,
                          onDragStart,
                          onDragEnd,
                          onContextMenu,
                      }) => {
    // file.path = "domain/folder/file.ext"
    const parts = (file.path || '').split('/');
    const filenameFromPath = parts.pop() || '';
    const filename = file.name || filenameFromPath;
    const dirPath = parts.join('/'); // domain/folder (χωρίς filename)

    return (
        <div
            className={`tree-file ${dragging ? 'dragging' : ''}`}
            draggable={true}
            title={`${file.path}\n${file.domain} · ${file.filetype} · ${file.filesize}B`}
            style={{
                padding: '6px 10px',
                margin: '2px 6px',
                borderRadius: 4,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                background: highlighted
                    ? `${cuboColor}33`
                    : selected
                        ? '#dbeafe'
                        : undefined,
                borderLeft: `3px solid ${cuboColor}`,
            }}
            onClick={(e) => onClick && onClick(e, file)}
            onDoubleClick={() => onDoubleClick && onDoubleClick(file)}
            onDragStart={(e) => onDragStart && onDragStart(e, file)}
            onDragEnd={() => onDragEnd && onDragEnd()}
            onContextMenu={(e) => onContextMenu && onContextMenu(e, file)}
        >
            {/* Γραμμή 1: filename + badges */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                width: '100%',
            }}>
                <span style={{ fontSize: 11, opacity: 0.7 }}>📄</span>
                <span style={{
                    fontSize: 13,
                    fontFamily: 'monospace',
                    fontWeight: 500,
                    color: '#1e293b',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}>
                    {filename}
                </span>
                <span style={{
                    marginLeft: 'auto',
                    fontSize: 10,
                    color: '#94a3b8',
                    flexShrink: 0,
                    display: 'flex',
                    gap: 6,
                    alignItems: 'center',
                }}>
                    <span style={{
                        background: '#f1f5f9',
                        padding: '1px 5px',
                        borderRadius: 3,
                        textTransform: 'uppercase',
                        fontWeight: 600,
                    }}>
                        {file.filetype}
                    </span>
                    {file.version && (
                        <span style={{ fontFamily: 'monospace' }}>
                            v{file.version}
                        </span>
                    )}
                </span>
            </div>

            {/* Γραμμή 2: μόνο το directory path (χωρίς filename) */}
            <div
                title={dirPath}
                style={{
                    fontSize: 10,
                    color: '#94a3b8',
                    fontFamily: 'monospace',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    paddingLeft: 17,
                }}
            >
                {dirPath || '—'}
            </div>
        </div>
    );
};

export default CuboFileItem;