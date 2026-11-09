// components/TreeRenderer.jsx
//
// Recursive renderer για το file tree.
//
// Data shape (από getComponentFiles):
//   {
//     "admin": {
//       path: "public/admin",
//       children: {
//         "components": {
//           children: {
//             "Header.jsx": { type: "file", color: "#3b82f6", cubos_name: "...", cubos_title: "..." },
//             "layout": { children: { ... } }
//           }
//         }
//       }
//     }
//   }
//
// Expanded format (από useComponentManager):
//   { "admin": true, "admin/components": true, "admin/components/layout": true, ... }
//
// File detection:
//   node έχει .children → folder
//   αλλιώς → file
//
// Props (από FileTreeMode):
//   node, domain, level, expanded, searchTerm, dropTarget, dragged,
//   highlighted, selected, multiSelected,
//   onFileClick, onFileDoubleClick, onDragStart, onDragEnd,
//   onFolderClick, onDragOver, onDragLeave, onDrop, onContextMenu, onSearch

import React from 'react';
import FileTreeNode from './FileTreeNode';
import FolderTreeNode from './FolderTreeNode';

export default function TreeRenderer({
                                         node,
                                         domain,
                                         level = 0,
                                         expanded = {},
                                         searchTerm = '',
                                         dropTarget,
                                         dragged,
                                         highlighted = {},
                                         selected,
                                         multiSelected,
                                         onFileClick,
                                         onFileDoubleClick,
                                         onDragStart,
                                         onDragEnd,
                                         onFolderClick,
                                         onDragOver,
                                         onDragLeave,
                                         onDrop,
                                         onContextMenu,
                                         onSearch,
                                     }) {
    if (!node?.children) return null;

    // Sort: files πρώτα, μετά folders, alphabetical
    const sortedEntries = Object.entries(node.children).sort(
        ([keyA, childA], [keyB, childB]) => {
            const aIsFile = !childA.children;
            const bIsFile = !childB.children;
            if (aIsFile && !bIsFile) return -1;
            if (!aIsFile && bIsFile) return 1;
            return keyA.localeCompare(keyB);
        }
    );

    return (
        <div className="tree-children">
            {sortedEntries.map(([key, child]) => {
                // ─── Paths ─────────────────────────────────────────
                // currentPath: 'components/layout' (χωρίς domain)
                // fullPath:    'admin/components/layout' (με domain)
                // displayPath: για το selected/multiSelected (με domain)
                const currentPath = node.__basePath
                    ? `${node.__basePath}/${key}`
                    : key;

                // Το expanded key είναι ΜΕ domain prefix (βλ. selectFile)
                const expandedKey = `${domain}/${currentPath}`;

                const isFile = !child.children;

                // ─── Flags ─────────────────────────────────────────
                const isExpanded = !!expanded[expandedKey];

                const fullDisplayPath = `${domain}/${currentPath}`;

                const isSelected =
                    selected?.path === currentPath &&
                    selected?.domain === domain;

                const isHighlighted =
                    !!highlighted[currentPath] ||
                    !!highlighted[fullDisplayPath];

                const isMultiSelected =
                    multiSelected instanceof Set
                        ? multiSelected.has(fullDisplayPath)
                        : false;

                const isDragging =
                    dragged?.path === currentPath &&
                    dragged?.domain === domain;

                const isDropTarget = dropTarget === currentPath;

                // ─── File ──────────────────────────────────────────
                if (isFile) {
                    return (
                        <FileTreeNode
                            key={currentPath}
                            name={key}
                            domain={domain}
                            path={currentPath}
                            level={level}
                            meta={{
                                color: child.color,
                                cubos_name: child.cubos_name,
                                cubos_title: child.cubos_title,
                            }}
                            isSelected={isSelected}
                            isHighlighted={isHighlighted}
                            isMultiSelected={isMultiSelected}
                            isDragging={isDragging}
                            onClick={(e) =>
                                onFileClick?.(e, domain, currentPath, key)
                            }
                            onDoubleClick={() =>
                                onFileDoubleClick?.(domain, currentPath, key)
                            }
                            onDragStart={(e) =>
                                onDragStart?.(e, domain, currentPath, key)
                            }
                            onDragEnd={() => onDragEnd?.()}
                            onContextMenu={(e) =>
                                onContextMenu?.(e, {
                                    domain,
                                    path: currentPath,
                                    name: key,
                                    isFile: true,
                                })
                            }
                            onSearch={onSearch}
                        />
                    );
                }

                // ─── Folder ────────────────────────────────────────
                // Περνάμε το __basePath στο child node για το recurse,
                // ώστε τα παιδιά να υπολογίσουν σωστά το currentPath.
                const childNode = {
                    ...child,
                    __basePath: currentPath,
                };

                return (
                    <FolderTreeNode
                        key={currentPath}
                        name={key}
                        level={level}
                        isExpanded={isExpanded}
                        isDropTarget={isDropTarget}
                        onClick={() => onFolderClick?.(expandedKey, currentPath)}
                        onDragOver={(e) => onDragOver?.(e, currentPath)}
                        onDragLeave={() => onDragLeave?.()}
                        onDrop={(e) => onDrop?.(e, domain, currentPath)}
                        onContextMenu={(e) =>
                            onContextMenu?.(e, {
                                domain,
                                path: currentPath,
                                name: key,
                                isFile: false,
                            })
                        }
                    >
                        {isExpanded && (
                            <TreeRenderer
                                node={childNode}
                                domain={domain}
                                level={level + 1}
                                expanded={expanded}
                                searchTerm={searchTerm}
                                dropTarget={dropTarget}
                                dragged={dragged}
                                highlighted={highlighted}
                                selected={selected}
                                multiSelected={multiSelected}
                                onFileClick={onFileClick}
                                onFileDoubleClick={onFileDoubleClick}
                                onDragStart={onDragStart}
                                onDragEnd={onDragEnd}
                                onFolderClick={onFolderClick}
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onDrop={onDrop}
                                onContextMenu={onContextMenu}
                                onSearch={onSearch}
                            />
                        )}
                    </FolderTreeNode>
                );
            })}
        </div>
    );
}