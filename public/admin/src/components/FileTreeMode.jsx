// components/FileTreeMode.jsx
import React from 'react';
import DomainCard from './DomainCard';
import TreeRenderer from './TreeRenderer';

export default function FileTreeMode({
                                         data,
                                         expanded,
                                         searchTerm,
                                         dropTarget,
                                         dragged,
                                         highlighted,
                                         selected,
                                         multiSelected,
                                         lastClickedPath,
                                         onSelect,
                                         onOpen,
                                         onContextMenu,
                                         onDragStart,
                                         onDragOver,
                                         onDragLeave,
                                         onDrop,
                                         toggleFolder,
                                         expandPath,
                                         expandAllDomains,
                                     }) {
    const entries = Object.entries(data || {});

    if (entries.length === 0) {
        return (
            <div className="no-results">
                {searchTerm
                    ? `Δεν βρέθηκαν αποτελέσματα για "${searchTerm}"`
                    : 'Δεν βρέθηκαν components'}
            </div>
        );
    }

    return (
        <div className="domains-grid">
            {entries.map(([domain, node]) => {
                const isExpanded = !!expanded[domain];
                return (
                    <DomainCard
                        key={domain}
                        domain={domain}
                        nodePath={node?.path}
                        isExpanded={isExpanded}
                        isDropTarget={dropTarget === domain}
                        onToggle={() => toggleFolder(domain)}
                        onDragOver={(e) => onDragOver?.(e, domain)}
                        onDragLeave={() => onDragLeave?.()}
                        onDrop={(e) => onDrop?.(e, domain)}
                        onContextMenu={(e) => onContextMenu?.(e, {
                            domain,
                            path: domain,
                            name: domain,
                            isFile: false,
                        })}
                    >
                        <TreeRenderer
                            node={node}
                            domain={domain}
                            level={1}
                            expanded={expanded}
                            searchTerm={searchTerm}
                            dropTarget={dropTarget}
                            dragged={dragged}
                            highlighted={highlighted}
                            selected={selected}
                            multiSelected={multiSelected}
                            // ✅ ΔΙΟΡΘΩΣΗ: πέρνα το `e` (event)
                            onFileClick={(e, d, p, n) => onSelect?.(e, d, p, n)}
                            onFileDoubleClick={(d, p, n) => onOpen?.(d, p, n)}
                            onDragStart={onDragStart}
                            onDragEnd={() => {}}
                            onFolderClick={toggleFolder}
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            onContextMenu={onContextMenu}
                            onSearch={() => {}}
                        />
                    </DomainCard>
                );
            })}
        </div>
    );
}