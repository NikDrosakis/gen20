// components/superadmin/FileTreeMode.jsx
import React from 'react';

const FileTreeMode = ({
                          filteredData,
                          searchTerm,
                          expanded,
                          toggleFolder,
                          dragged,
                          dropTarget,
                          highlighted,
                          selected,
                          multiSelected,
                          handleFileClick,
                          openEditor,
                          handleDragStart,
                          handleDragOver,
                          handleDragLeave,
                          handleDrop,
                          handleContextMenu,
                          setDragged,
                          setSearchTerm,
                      }) => {

    const renderTree = (node, path = '', level = 0, domain = '') => {
        if (!node.children) return null;

        const sortedEntries = Object.entries(node.children).sort(([keyA, childA], [keyB, childB]) => {
            const aIsFile = !childA.children;
            const bIsFile = !childB.children;
            if (aIsFile && !bIsFile) return -1;
            if (!aIsFile && bIsFile) return 1;
            return keyA.localeCompare(keyB);
        });

        return (
            <div className="tree-children">
                {sortedEntries.map(([key, child]) => {
                    const currentPath = path ? `${path}/${key}` : key;
                    const fullPath = `${domain}/${currentPath}`;
                    const isFile = !child.children;
                    const isExpanded = searchTerm.trim() !== '' || expanded[currentPath];
                    const isDropTarget = dropTarget === currentPath && !isFile;
                    const isHighlighted = highlighted[currentPath] || selected?.path === currentPath;
                    const isSelected = selected?.path === currentPath;
                    const isMultiSelected = multiSelected.has(fullPath);

                    return (
                        <div key={currentPath} className="tree-node">
                            {isFile ? (
                                <div
                                    className={`tree-file ${dragged?.path === currentPath ? 'dragging' : ''}`}
                                    style={{
                                        paddingLeft: `${level * 16 + 24}px`,
                                        background: child.color
                                            ? `${child.color}CC`
                                            : isMultiSelected
                                                ? '#bfdbfe'
                                                : (isHighlighted ? '#dbeafe' : undefined),
                                        color: child.color ? '#fff' : undefined,
                                        fontWeight: child.color ? 600 : undefined,
                                        border: isMultiSelected ? '2px solid #3b82f6' : undefined,
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                    }}
                                    title={child.cubos_title ? `Cubos: ${child.cubos_title}` : undefined}
                                    draggable={true}
                                    onClick={(e) => handleFileClick(e, domain, currentPath, key)}
                                    onDoubleClick={() => openEditor(currentPath)}
                                    onDragStart={(e) => handleDragStart(e, domain, currentPath, key)}
                                    onDragEnd={() => setDragged(null)}
                                    onContextMenu={(e) => handleContextMenu(e, {
                                        domain, path: currentPath, name: key, isFile: true,
                                    })}
                                >
                                    <span className="file-icon">📄</span>
                                    <span className="file-name">{key}</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSearchTerm(key); }}
                                        title="Search for this file"
                                        style={{
                                            border: 'none', background: 'transparent',
                                            cursor: 'pointer', padding: 2, fontSize: 12, opacity: 0.6,
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = 0.6}
                                    >🔍</button>
                                    {child.cubos_name && (
                                        <span style={{ marginLeft: 8, fontSize: 10, opacity: 0.8 }}>
                                            {child.cubos_name}
                                        </span>
                                    )}
                                    {isSelected && (
                                        <span style={{ marginLeft: 8, color: '#3b82f6', fontWeight: 600 }}>●</span>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div
                                        className={`tree-folder ${isDropTarget ? 'drop-target' : ''}`}
                                        style={{ paddingLeft: `${level * 16}px` }}
                                        onClick={() => toggleFolder(currentPath)}
                                        onDragOver={(e) => handleDragOver(e, currentPath)}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, domain, currentPath)}
                                        onContextMenu={(e) => handleContextMenu(e, {
                                            domain, path: currentPath, name: key, isFile: false,
                                        })}
                                    >
                                        <span className="arrow-icon">{isExpanded ? '▼' : '▶'}</span>
                                        <span className="folder-icon">📁</span>
                                        <span className="folder-name">{key}</span>
                                    </div>
                                    {isExpanded && renderTree(child, currentPath, level + 1, domain)}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="domains-grid">
            {Object.entries(filteredData).length === 0 ? (
                <div className="no-results">
                    {searchTerm
                        ? `Δεν βρέθηκαν αποτελέσματα για "${searchTerm}"`
                        : 'Δεν βρέθηκαν components'}
                </div>
            ) : (
                Object.entries(filteredData).map(([domain, node]) => {
                    const isExpanded = expanded[domain];
                    return (
                        <div
                            key={domain}
                            className="domain-card"
                            onDragOver={(e) => {
                                e.preventDefault();
                                if (!dragged) return;
                                e.dataTransfer.dropEffect = dragged.domain === domain ? 'move' : 'copy';
                                setDropTarget(domain);
                            }}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, domain, domain)}
                            onContextMenu={(e) => handleContextMenu(e, {
                                domain, path: domain, name: domain, isFile: false,
                            })}
                        >
                            <div className="domain-header" onClick={() => toggleFolder(domain)}>
                                <span className="arrow-icon">{isExpanded ? '▼' : '▶'}</span>
                                <h3>{domain}</h3>
                            </div>
                            <div className="domain-path">{node.path}/src</div>
                            {isExpanded && renderTree(node, domain, 1, domain)}
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default FileTreeMode;