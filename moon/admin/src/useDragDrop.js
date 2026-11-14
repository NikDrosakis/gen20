import { useCallback, useRef, useState } from 'react';

/**
 * Μικρό native HTML5 drag & drop helper.
 * Δεν χρειάζεται βιβλιοθήκη.
 *
 * Χρήση:
 *   const { dragProps, dropProps, dragging } = useDragDrop({
 *     onDrop: (payload, target) => {...},
 *   });
 */
export function useDragDrop({ onDrop } = {}) {
    const [dragging, setDragging] = useState(null);
    const payloadRef = useRef(null);

    const makeDragProps = (payload, { source, effect = 'move' } = {}) => ({
        draggable: true,
        onDragStart: (e) => {
            const data = { ...payload, source };
            payloadRef.current = data;
            setDragging(data);
            try {
                e.dataTransfer.setData('text/plain', JSON.stringify(data));
                e.dataTransfer.effectAllowed = effect;
            } catch {
                /* Safari quirks */
            }
        },
        onDragEnd: () => {
            setDragging(null);
            payloadRef.current = null;
        },
    });

    const makeDropProps = (target) => ({
        onDragOver: (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            e.currentTarget.classList.add('drag-over');
        },
        onDragLeave: (e) => {
            e.currentTarget.classList.remove('drag-over');
        },
        onDrop: (e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('drag-over');
            let data = payloadRef.current;
            if (!data) {
                try {
                    data = JSON.parse(e.dataTransfer.getData('text/plain') || 'null');
                } catch {
                    data = null;
                }
            }
            if (data) onDrop?.(data, target);
            setDragging(null);
            payloadRef.current = null;
        },
    });

    return { dragging, makeDragProps, makeDropProps };
}