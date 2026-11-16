// src/unitSchema.js
export const UNIT_SCHEMAS = {
    contentOne: {
        label: 'Content One',
        source: 'default',
        fields: [
            { key: 'id', label: 'Post', type: 'select', default: 1 },
        ],
    },
    contentLoop: {
        label: 'Content Loop',
        source: 'default',
        fields: [
            { key: 'classificationid', label: 'Classification', type: 'select', default: 1 },
        ],
    },
};

export function getSchema(kind) {
    return UNIT_SCHEMAS[kind] ?? null;
}

export function getDefaults(kind) {
    const s = getSchema(kind);
    if (!s) return {};
    return Object.fromEntries(s.fields.map((f) => [f.key, f.default]));
}

function coerce(field, value) {
    if (value === undefined || value === null || value === '') return field.default;
    switch (field.type) {
        case 'number':
        case 'range':
            return Number(value);
        case 'boolean':
            return value === true || value === 'true' || value === 1 || value === '1';
        case 'select':
            return typeof field.default === 'number' ? Number(value) : value;
        default:
            return value;
    }
}

export function normalizeParams(kind, params) {
    const s = getSchema(kind);
    if (!s) return params ?? {};
    const out = { ...getDefaults(kind) };
    for (const f of s.fields) {
        if (params && params[f.key] !== undefined) {
            out[f.key] = coerce(f, params[f.key]);
        }
    }
    return out;
}