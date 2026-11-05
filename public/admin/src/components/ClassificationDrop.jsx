// /ClassificationDrop.jsx
import React, { useState, useEffect } from 'react';

const ClassificationDrop = ({
                                    classificationid,
                                    onChange,
                                    publicdb,
                                    placeholder = "-- Select Category --",
                                    className = "form-select",
                                    disabled = false,
                                    showNotification
                                }) => {
    const [classifications, setClassifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClassifications();
    }, [publicdb]);

    const fetchClassifications = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/v1/maria/fa?folder=select%20*%20from%20${publicdb}.classification`);
            const result = await response.json();
            let classificationsData = [];
            if (result.success && result.data) {
                if (Array.isArray(result.data)) classificationsData = result.data;
            } else if (Array.isArray(result)) classificationsData = result;
            setClassifications(classificationsData);
        } catch (error) {
            console.error('Error fetching classifications:', error);
            if (showNotification) {
                showNotification('Failed to load categories', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const getClassificationTitle = (item) => {
        return item.title_en || item.title || `Category ${item.id}`;
    };

    return (
        <select
            className={className}
            value={classificationid || ''}
            onChange={(e) => onChange(parseInt(e.target.value))}
            disabled={disabled || loading}
        >
            <option value="">{loading ? 'Loading categories...' : placeholder}</option>
            {!loading && classifications.map(cat => (
                <option key={cat.id} value={cat.id}>
                    {getClassificationTitle(cat)}
                </option>
            ))}
        </select>
    );
};

export default ClassificationDrop;