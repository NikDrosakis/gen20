// hooks/useDomainContext.js
import { useMemo } from 'react';
import { useG } from '../contexts/GContext.jsx';

export function useDomainContext() {
    const { G } = useG();

    return useMemo(() => {
        const publicdb = G?.publicdb ?? null;

        // ✅ ΜΟΝΗ ΑΛΛΑΓΗ: το domain έρχεται από G.DOMAIN
        const rawDomain = G?.DOMAIN ?? null;

        const domain = rawDomain
            ? rawDomain.replace(/^www\./i, '').toLowerCase()
            : null;

        return {
            ready: Boolean(publicdb && domain),
            publicdb,
            domain,
            domainId: G?.domain_id ?? null,
            admindb: 'gen_admin',
        };
    }, [G]);
}