import { getSchema } from './unitSchema';

export default function ParamsForm({
                                       kind,
                                       params,
                                       options = {},
                                       loading = false,
                                       onChange,
                                   }) {
    const schema = getSchema(kind);
    if (!schema) return null;

    const set = (key, value) => onChange({ ...params, [key]: value });

    return (
        <div className="params-form">
            {schema.fields.map((f) => {
                const fieldOptions = options?.[kind]?.[f.key] ?? f.options ?? [];

                return (
                    <label key={f.key} className="params-form__field">
                        <span className="params-form__label">{f.label}</span>

                        {f.type === 'select' && (
                            <select
                                value={params?.[f.key] ?? ''}
                                disabled={loading && fieldOptions.length === 0}
                                onChange={(e) => {
                                    const raw = e.target.value;
                                    const isNum = typeof f.default === 'number';
                                    set(f.key, isNum ? Number(raw) : raw);
                                }}
                            >
                                {loading && fieldOptions.length === 0 && (
                                    <option value="">Loading…</option>
                                )}
                                {!loading && fieldOptions.length === 0 && (
                                    <option value="">—</option>
                                )}
                                {fieldOptions.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        )}

                        {f.type === 'number' && (
                            <input
                                type="number"
                                min={f.min}
                                max={f.max}
                                value={params?.[f.key] ?? ''}
                                onChange={(e) => set(f.key, Number(e.target.value))}
                            />
                        )}

                        {f.type === 'text' && (
                            <input
                                type="text"
                                value={params?.[f.key] ?? ''}
                                onChange={(e) => set(f.key, e.target.value)}
                            />
                        )}

                        {f.type === 'boolean' && (
                            <input
                                type="checkbox"
                                checked={!!params?.[f.key]}
                                onChange={(e) => set(f.key, e.target.checked)}
                            />
                        )}

                        {f.type === 'range' && (
                            <input
                                type="range"
                                min={f.min ?? 0}
                                max={f.max ?? 100}
                                value={params?.[f.key] ?? 0}
                                onChange={(e) => set(f.key, Number(e.target.value))}
                            />
                        )}
                    </label>
                );
            })}
        </div>
    );
}