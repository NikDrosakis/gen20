
import { useState, useCallback } from 'react';

export default function useMail({
                                    endpoint = '/api/v1/local/sendMail',
                                } = {}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const send = useCallback(async (data) => {
        if (loading) return null;

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (!response.ok || result.data?.success !== true) {
                throw new Error(result.data?.error || result.data?.message || 'Mail delivery failed.');
            }


            setSuccess(true);
            return result;

        } catch (err) {
            setError(err.message || 'Mail delivery failed.');
            throw err;

        } finally {
            setLoading(false);
        }
    }, [endpoint, loading]);

    const reset = useCallback(() => {
        setError(null);
        setSuccess(false);
    }, []);

    return {
        send,
        loading,
        error,
        success,
        reset,
    };
}
