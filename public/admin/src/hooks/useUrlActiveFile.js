// hooks/useUrlActiveFile.js
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useUrlActiveFile() {
    const [searchParams, setSearchParams] = useSearchParams();

    const activeFile = useMemo(() => {
        const domain = searchParams.get('domain');
        const file = searchParams.get('file');
        if (!domain || !file) return null;
        return {
            domain,
            path: file,
            name: file.split('/').pop(),
        };
    }, [searchParams]);

    // display path string (για CodeEditorPane / getFileMeta)
    const activeFilePath = activeFile?.path ?? null;

    const openFile = useCallback((domain, path) => {
        if (!domain || !path) return;
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('domain', domain);
            next.set('file', path);
            return next;
        }, { replace: false });
    }, [setSearchParams]);

    const closeFile = useCallback(() => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.delete('domain');
            next.delete('file');
            return next;
        }, { replace: false });
    }, [setSearchParams]);

    return { activeFile, activeFilePath, openFile, closeFile };
}