// hooks/useFileTree.js
import { useMemo, useCallback, useState } from 'react';

export function useFileTree(data, searchTerm) {
    const [expanded, setExpanded] = useState({});

    const toggleFolder = useCallback((path) => {
        setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
    }, []);

    const expandPath = useCallback((path) => {
        const parts = path.split('/');
        setExpanded(prev => {
            const next = { ...prev };
            for (let i = 1; i <= parts.length; i++) {
                next[parts.slice(0, i).join('/')] = true;
            }
            return next;
        });
    }, []);

    const expandAllDomains = useCallback(() => {
        setExpanded(prev => {
            const next = { ...prev };
            Object.keys(data || {}).forEach(d => (next[d] = true));
            return next;
        });
    }, [data]);

    const filterTree = useCallback((node, term) => {
        if (!term) return node;
        if (!node.children) return null;
        const lowerTerm = term.toLowerCase();
        const filteredChildren = {};
        let hasMatch = false;

        for (const [key, child] of Object.entries(node.children)) {
            const childMatch = key.toLowerCase().includes(lowerTerm);
            const filteredChild = filterTree(child, term);
            if (childMatch || filteredChild) {
                filteredChildren[key] = childMatch ? child : filteredChild;
                hasMatch = true;
            }
        }
        return hasMatch ? { ...node, children: filteredChildren } : null;
    }, []);

    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        const result = {};
        const lowerTerm = searchTerm.toLowerCase();
        for (const [domain, domainData] of Object.entries(data || {})) {
            const domainMatch = domain.toLowerCase().includes(lowerTerm) ||
                domainData.path?.toLowerCase().includes(lowerTerm);
            const filtered = filterTree(domainData, searchTerm);
            if (domainMatch || filtered) result[domain] = filtered || domainData;
        }
        return result;
    }, [data, searchTerm, filterTree]);

    return {
        expanded,
        toggleFolder,
        expandPath,
        expandAllDomains,
        filteredData,
    };
}