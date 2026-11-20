// unitSchema.js
export const UNIT_SCHEMAS = {
    contentOne: {
        label: 'ContentOne',
        source: 'default',
        fields: [
            { key: 'id', type: 'select', label: 'Post', default: 1 },
        ],
    },
    contentLoop: {
        label: 'ContentLoop',
        source: 'default',
        fields: [
            { key: 'classificationid', type: 'select', label: 'Classification', default: 1 },
        ],
    },
};

// Νέο: δυναμικό schema από astralist.json
let dynamicSchemas = {};

export function setDynamicSchemas(cubos) {
    dynamicSchemas = {};
    for (const cubo of cubos) {
        if (cubo.params) {
            dynamicSchemas[cubo.name] = {
                label: cubo.title || cubo.name,
                source: 'astra',
                fields: Object.entries(cubo.params).map(([key, def]) => ({
                    key,
                    type: def.type || 'text',
                    label: def.label || key,
                    default: def.default,
                    required: def.required,
                    options: def.options,
                    keys: def.keys,
                    dependsOn: def.dependsOn,
                })),
            };
        }
    }
}

export function getSchema(kind) {
    return dynamicSchemas[kind] || UNIT_SCHEMAS[kind] || null;
}

export function normalizeParams(kind, params) {
    const schema = getSchema(kind);
    if (!schema) return params;
    const defaults = Object.fromEntries(schema.fields.map(f => [f.key, f.default]));
    return { ...defaults, ...params };
}