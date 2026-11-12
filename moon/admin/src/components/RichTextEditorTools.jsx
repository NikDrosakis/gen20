// components/RichTextEditorTools.jsx
import React from 'react';

const ZOOM_OPTIONS = [50, 75, 90, 100, 110, 125, 150, 200];

const FONT_FAMILIES = [
    { label: 'Default',         value: '' },
    { label: 'Arial',           value: 'Arial, sans-serif' },
    { label: 'Helvetica',       value: 'Helvetica, Arial, sans-serif' },
    { label: 'Verdana',         value: 'Verdana, sans-serif' },
    { label: 'Tahoma',          value: 'Tahoma, sans-serif' },
    { label: 'Trebuchet MS',    value: '"Trebuchet MS", sans-serif' },
    { label: 'Georgia',         value: 'Georgia, serif' },
    { label: 'Times New Roman', value: '"Times New Roman", serif' },
    { label: 'Garamond',        value: 'Garamond, serif' },
    { label: 'Palatino',        value: '"Palatino Linotype", "Book Antiqua", Palatino, serif' },
    { label: 'Courier New',     value: '"Courier New", monospace' },
    { label: 'Monaco',          value: 'Monaco, monospace' },
    { label: 'Consolas',        value: 'Consolas, monospace' },
    { label: 'Comic Sans MS',   value: '"Comic Sans MS", cursive' },
];

const FONT_SIZES = ['8','9','10','11','12','14','16','18','20','24','28','32','36','48','60','72'];

const LINE_HEIGHTS = [
    { label: '1.0',  value: '1' },
    { label: '1.15', value: '1.15' },
    { label: '1.5',  value: '1.5' },
    { label: '2.0',  value: '2' },
    { label: '2.5',  value: '2.5' },
    { label: '3.0',  value: '3' },
];

const RichTextEditorTools = ({
                                 onCommand,
                                 onFormatBlock,
                                 onSetLineHeight,
                                 onCleanHtml,
                                 onSetFontSize,
                                 onSetFontFamily,
                                 zoom,               // ✅ πίσω
                                 onZoomChange,       // ✅ πίσω
                                 disabled = false,
                             }) => {
    const btn = (label, title, onClick, extraClass = '') => (
        <button
            type="button"
            className={`rte-tool-btn ${extraClass}`.trim()}
            title={title}
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
        >
            {label}
        </button>
    );

    const sep = () => <span className="rte-tool-sep" />;

    return (
        <div className="rte-toolbar">
            {/* ✅ Zoom (view-only) */}
            <select
                className="rte-tool-select"
                title="Zoom (μόνο προβολή — δεν αποθηκεύεται)"
                value={zoom}
                onChange={(e) => onZoomChange(Number(e.target.value))}
                disabled={disabled}
            >
                {ZOOM_OPTIONS.map(z => (
                    <option key={z} value={z}>{z}%</option>
                ))}
            </select>

            {sep()}

            {/* Paragraph style */}
            <select
                className="rte-tool-select"
                title="Paragraph style"
                onChange={(e) => onFormatBlock(e.target.value)}
                disabled={disabled}
                defaultValue="P"
            >
                <option value="P">Normal text</option>
                <option value="H1">Heading 1</option>
                <option value="H2">Heading 2</option>
                <option value="H3">Heading 3</option>
                <option value="H4">Heading 4</option>
                <option value="BLOCKQUOTE">Quote</option>
            </select>

            {sep()}

            {btn('•', 'Bullet list', () => onCommand('insertUnorderedList'))}
            {btn('1.', 'Numbered list', () => onCommand('insertOrderedList'))}

            {sep()}

            {btn('L', 'Align left',   () => onCommand('justifyLeft'))}
            {btn('C', 'Align center', () => onCommand('justifyCenter'))}
            {btn('R', 'Align right',  () => onCommand('justifyRight'))}

            {sep()}

            {btn('⇤', 'Decrease indent', () => onCommand('outdent'))}
            {btn('⇥', 'Increase indent', () => onCommand('indent'))}

            {sep()}

            <select
                className="rte-tool-select rte-tool-select-sm"
                title="Line height (διάστιχο)"
                onChange={(e) => onSetLineHeight(e.target.value)}
                disabled={disabled}
                defaultValue=""
            >
                <option value="">Line</option>
                {LINE_HEIGHTS.map(lh => (
                    <option key={lh.value} value={lh.value}>{lh.label}</option>
                ))}
            </select>

            <select
                className="rte-tool-select rte-tool-select-sm"
                title="Font size"
                onChange={(e) => onSetFontSize(e.target.value)}
                disabled={disabled}
                defaultValue="14"
            >
                {FONT_SIZES.map(s => (
                    <option key={s} value={s}>{s}</option>
                ))}
            </select>

            <select
                className="rte-tool-select"
                title="Font family"
                onChange={(e) => onSetFontFamily(e.target.value)}
                disabled={disabled}
                defaultValue=""
            >
                {FONT_FAMILIES.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                ))}
            </select>

            {sep()}

            {btn('🧹 Clean', 'Clean HTML (whole block)', onCleanHtml, 'rte-tool-btn-warn')}
        </div>
    );
};

export default RichTextEditorTools;