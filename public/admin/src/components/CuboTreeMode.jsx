// components/CuboTreeMode.jsx
import React from 'react';
import CuboCard from './CuboCard';

const CuboTreeMode = ({
                          filteredCubos,
                          cuboLoading,
                          cuboError,
                          cuboExpanded,
                          toggleCuboFolder,
                          searchTerm,
                          // drag/drop
                          dragged,
                          dropTarget,
                          setDragged,
                          setDropTarget,
                          handleDragStart,
                          handleDropOnCubo,
                          handleDropOnDomain,
                          // actions
                          onOpenEditor,       // (path) => openEditor(path)
                          onContextMenu,      // (e, target) => handleContextMenu(e, target)
                          highlighted,
                          selected,
                      }) => {
    if (cuboLoading) {
        return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            ⏳ Φόρτωση cubos...
        </div>;
    }
    if (cuboError) {
        return <div style={{
            padding: 20, color: '#dc3545', background: '#fee2e2',
            borderRadius: 8,
        }}>⚠️ {cuboError}</div>;
    }
    if (!filteredCubos.length) {
        return <div className="no-results">
            {searchTerm ? `Δεν βρέθηκαν cubos για "${searchTerm}"` : 'Δεν υπάρχουν cubos'}
        </div>;
    }

    return (
        <div className="domains-grid">
            {filteredCubos.map(cubo => {
                const key = `cubo:${cubo.id}`;
                const isExpanded = !!cuboExpanded[key];
                const isDropTarget = dropTarget === key;

                return (
                    <CuboCard
                        key={cubo.id}
                        cubo={cubo}
                        isExpanded={isExpanded}
                        isDropTarget={isDropTarget}
                        onToggle={() => toggleCuboFolder(cubo.id)}
                        onDragOver={(e) => {
                            e.preventDefault();
                            if (!dragged) return;
                            e.dataTransfer.dropEffect = 'copy';
                            setDropTarget(key);
                        }}
                        onDragLeave={() => setDropTarget(null)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDropTarget(null);
                            if (!dragged) return;
                            handleDropOnCubo(e, cubo.id, dragged.path, dragged.domain);
                        }}
                        onContextMenu={(e) => onContextMenu(e, {
                            domain: 'cubo', path: key, name: cubo.name, isFile: false, cubo,
                        })}
                        // files
                        files={cubo.files}
                        highlighted={highlighted}
                        selected={selected}
                        draggedPath={dragged?.path}
                        onFileClick={(e, file) => {
                            // single click → compare (reuse selectFile)
                            // multi-select στο cubo mode = απλό select
                        }}
                        onFileDoubleClick={(file) => onOpenEditor(file.path)}
                        onFileDragStart={(e, file) => handleDragStart(e, file.domain, file.path, file.name)}
                        onFileDragEnd={() => setDragged(null)}
                        onFileContextMenu={(e, file) => onContextMenu(e, {
                            domain: file.domain, path: file.path, name: file.name, isFile: true,
                            inCubo: cubo.id,
                        })}
                        // domain install drop targets (μέσα στο cubo: μόνο info)
                        onDropOnDomain={(e, targetDomain) => {
                            if (!dragged) return;
                            handleDropOnDomain(e, targetDomain);
                        }}
                    />
                );
            })}
        </div>
    );
};

export default CuboTreeMode;