import { useState, useEffect, useMemo } from "react";
import "./DatasetTable.css";

export default function DatasetTable({
                                         tableName = "gen_gen20gr.clinvar_vcv",
                                         pageSize = 50
                                     }) {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [queryInfo, setQueryInfo] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);
    const [error, setError] = useState(null);
    const [columns, setColumns] = useState([]);

    // Build the JOIN query
    const buildJoinQuery = (offset, limit) => {
        return `
            SELECT 
                cv.*,
                cs.Description AS sub_Description,
                cs.SubmittedPhenotypeInfo,
                cs.ReportedPhenotypeInfo,
                cs.ReviewStatus AS sub_ReviewStatus,
                cs.CollectionMethod,
                ci.Submitter1,
                ci.Submitter1_SCV,
                ci.Submitter1_ClinSig,
                ci.Submitter1_ReviewStatus,
                ci.Submitter1_Sub_Condition,
                ci.Submitter1_Description AS sub1_Description,
                ci.Submitter2,
                ci.Submitter2_SCV,
                ci.Submitter2_ClinSig,
                ci.Submitter2_ReviewStatus,
                ci.Submitter2_Sub_Condition,
                ci.Submitter2_Description AS sub2_Description,
                ci.Rank_diff,
                ci.Conflict_Reported
            FROM ${tableName} cv
            LEFT JOIN gen_gen20gr.clinvar_submissions cs 
                ON cv.variation_id = cs.VariationID
            LEFT JOIN gen_gen20gr.clinvar_interpretations ci 
                ON cv.variation_id = ci.NCBI_Variation_ID
            WHERE cv.clinical_significance='Uncertain significance'
            LIMIT ${offset}, ${limit}
        `;
    };

    // Build count query
    const buildCountQuery = () => {
        return `SELECT COUNT(*) as total FROM ${tableName}`;
    };

    // Load records using fa query
    const loadFromFaQuery = async (page = 0) => {
        setLoading(true);
        setError(null);

        const offset = page * pageSize;
        const query = buildJoinQuery(offset, pageSize);
        setQueryInfo({ type: "fa", query: query });

        try {
            const response = await fetch(`/api/v1/maria/fa?q=${encodeURIComponent(query)}`);
            const result = await response.json();

            if (result.success && result.data) {
                let data = result.data;

                // Handle different response formats
                if (data.result) {
                    data = data.result;
                } else if (data.rows) {
                    data = data.rows;
                } else if (Array.isArray(data)) {
                    data = data;
                } else if (data.results) {
                    data = data.results;
                }

                // If data is array of arrays with headers, convert to objects
                if (Array.isArray(data) && data.length > 0) {
                    if (Array.isArray(data[0])) {
                        // Data is array of arrays - need headers
                        const headers = result.headers || result.fields || [];
                        if (headers.length > 0) {
                            const objects = data.map(row => {
                                const obj = {};
                                headers.forEach((header, i) => {
                                    obj[header] = row[i];
                                });
                                return obj;
                            });
                            setRecords(objects);
                            if (columns.length === 0 && objects.length > 0) {
                                setColumns(Object.keys(objects[0]));
                            }
                        } else {
                            setRecords(data);
                        }
                    } else {
                        // Data is array of objects
                        setRecords(data);
                        if (columns.length === 0 && data.length > 0) {
                            setColumns(Object.keys(data[0]));
                        }
                    }
                } else {
                    setRecords([]);
                }
            } else {
                console.error("Failed to load from fa:", result);
                setError(result.message || "Failed to load data");
                setRecords([]);
            }
        } catch (error) {
            console.error("Error fetching fa data:", error);
            setError(error.message || "Network error");
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };

    // Get total count using /api/v1/maria/f
    const getTotalCount = async () => {
        try {
            const query = buildCountQuery();
            const response = await fetch(`/api/v1/maria/f?q=${encodeURIComponent(query)}`);
            const result = await response.json();

            if (result.success && result.data) {
                const total = result.data.total;
                setTotalRecords(parseInt(total) || 0);
            } else {
                console.error("Failed to get total count:", result);
                setTotalRecords(0);
            }
        } catch (error) {
            console.error("Error getting total count:", error);
            setTotalRecords(0);
        }
    };

    // Load data
    const loadData = async (page = 0) => {
        setCurrentPage(page);
        await Promise.all([
            loadFromFaQuery(page),
            getTotalCount()
        ]);
    };

    useEffect(() => {
        loadData(0);
    }, [tableName]);

    // Update columns when records change
    useEffect(() => {
        if (records.length > 0 && columns.length === 0) {
            setColumns(Object.keys(records[0]));
        }
    }, [records]);

    // Filter records by search term (client-side)
    const filteredRecords = useMemo(() => {
        if (!searchTerm.trim()) return records;
        const term = searchTerm.toLowerCase().trim();
        return records.filter(record => {
            return Object.values(record).some(value => {
                if (value === null || value === undefined) return false;
                return String(value).toLowerCase().includes(term);
            });
        });
    }, [records, searchTerm]);

    const totalPages = Math.ceil(totalRecords / pageSize);

    // Get badge class for clinical significance
    const getClinicalSignificanceBadge = (value) => {
        if (!value) return "badge";
        const lower = String(value).toLowerCase();
        if (lower.includes("pathogenic") && !lower.includes("likely")) return "badge badge-pathogenic";
        if (lower.includes("likely pathogenic")) return "badge badge-likely_pathogenic";
        if (lower.includes("benign") && !lower.includes("likely")) return "badge badge-benign";
        if (lower.includes("likely benign")) return "badge badge-likely_benign";
        if (lower.includes("uncertain")) return "badge badge-uncertain";
        if (lower.includes("conflicting")) return "badge badge-conflicting";
        return "badge";
    };

    // Get badge class for conflict
    const getConflictBadge = (value) => {
        if (!value) return null;
        if (value.toLowerCase() === "yes") {
            return <span className="badge badge-conflict" style={{ background: "#ffebee", color: "#c62828" }}>⚠️ Conflict</span>;
        }
        if (value.toLowerCase() === "no") {
            return <span className="badge badge-no-conflict" style={{ background: "#e8f5e9", color: "#2e7d32" }}>✓ No Conflict</span>;
        }
        return null;
    };

    // Truncate long text
    const truncateText = (text, maxLength = 100) => {
        if (!text) return "-";
        const str = String(text);
        return str.length > maxLength ? str.substring(0, maxLength) + "..." : str;
    };

    // Format date
    const formatDate = (value) => {
        if (!value) return "-";
        try {
            const date = new Date(value);
            if (isNaN(date.getTime())) return value;
            return date.toLocaleDateString();
        } catch {
            return value;
        }
    };

    // Check if column should be hidden
    const shouldHideColumn = (col) => {
        const hiddenColumns = ['id', '_import_date', '_file_name', 'file_name', 'import_date'];
        return hiddenColumns.includes(col);
    };

    // Get column display name
    const getColumnDisplayName = (col) => {
        // Clean up column names for display
        const nameMap = {
            'sub_Description': 'Submission Description',
            'sub_ReviewStatus': 'Submission Review Status',
            'sub1_Description': 'Submitter 1 Description',
            'sub2_Description': 'Submitter 2 Description',
            'Submitter1_ClinSig': 'Submitter 1 Clinical Significance',
            'Submitter2_ClinSig': 'Submitter 2 Clinical Significance',
            'Submitter1_ReviewStatus': 'Submitter 1 Review Status',
            'Submitter2_ReviewStatus': 'Submitter 2 Review Status',
            'Submitter1_Sub_Condition': 'Submitter 1 Condition',
            'Submitter2_Sub_Condition': 'Submitter 2 Condition',
            'Rank_diff': 'Rank Difference',
            'Conflict_Reported': 'Conflict Reported'
        };
        return nameMap[col] || col.replace(/_/g, ' ');
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            loadData(newPage);
        }
    };

    if (loading && records.length === 0) {
        return (
            <div className="dataset-container">
                <div className="dataset-loading">
                    <span className="dataset-empty-icon">⏳</span>
                    Loading records...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dataset-container">
                <div className="dataset-error" style={{ textAlign: "center", padding: "40px" }}>
                    <span className="dataset-empty-icon" style={{ fontSize: "48px" }}>❌</span>
                    <p style={{ color: "#c62828" }}>Error: {error}</p>
                    <button
                        onClick={() => loadData(0)}
                        style={{
                            padding: "8px 16px",
                            background: "#1976d2",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                        }}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Get visible columns
    const visibleColumns = columns.filter(col => !shouldHideColumn(col));

    return (
        <div className="dataset-container">
            <div className="dataset-header">
                <h2 className="dataset-title">📋 ClinVar Records with Submissions & Interpretations</h2>

                {/* Query Info */}
                {queryInfo && (
                    <div className="dataset-query-info">
                        <strong>🔍 Query:</strong>
                        <code style={{
                            background: "#f5f5f5",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            display: "block",
                            marginTop: "4px",
                            overflow: "auto",
                            whiteSpace: "pre-wrap",
                            maxHeight: "100px"
                        }}>
                            {queryInfo.query}
                        </code>
                    </div>
                )}

                {/* Stats and search */}
                <div className="dataset-stats" style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "15px",
                    alignItems: "center",
                    marginBottom: "15px"
                }}>
                    <span>
                        Total records: <strong>{totalRecords.toLocaleString()}</strong>
                        {records.length !== totalRecords &&
                            ` (showing ${records.length.toLocaleString()})`
                        }
                    </span>
                    <span>
                        Columns: <strong>{visibleColumns.length}</strong>
                    </span>
                    <input
                        type="text"
                        className="dataset-search"
                        placeholder="🔍 Search in current page..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(0);
                        }}
                        style={{
                            padding: "8px 12px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            fontSize: "14px",
                            flex: "1",
                            minWidth: "200px"
                        }}
                    />
                    <button
                        className="dataset-refresh-btn"
                        onClick={() => loadData(currentPage)}
                        disabled={loading}
                        style={{
                            padding: "8px 12px",
                            background: loading ? "#ccc" : "#1976d2",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: loading ? "not-allowed" : "pointer"
                        }}
                    >
                        {loading ? "⏳ Loading..." : "🔄 Refresh"}
                    </button>
                </div>

                {/* Table */}
                <div className="dataset-table-wrapper" style={{ overflowX: "auto" }}>
                    <table className="dataset-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                        <tr>
                            {visibleColumns.map(col => (
                                <th key={col} style={{
                                    textAlign: "left",
                                    padding: "12px",
                                    background: "#f5f5f5",
                                    borderBottom: "2px solid #ddd",
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    whiteSpace: "nowrap",
                                    position: "sticky",
                                    top: 0,
                                    zIndex: 10
                                }}>
                                    {getColumnDisplayName(col)}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {filteredRecords.length === 0 ? (
                            <tr>
                                <td colSpan={visibleColumns.length || 1}>
                                    <div className="dataset-empty" style={{ textAlign: "center", padding: "40px" }}>
                                        <span className="dataset-empty-icon" style={{ fontSize: "48px" }}>📭</span>
                                        <p>{loading ? "Loading..." : "No records found"}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredRecords.map((record, index) => (
                                <tr key={index} style={{ borderBottom: "1px solid #e9ecef" }}>
                                    {visibleColumns.map(col => {
                                        const value = record[col];

                                        // Special rendering for clinical_significance
                                        if (col === "clinical_significance" ||
                                            col === "clinical_significance_ordered" ||
                                            col === "Submitter1_ClinSig" ||
                                            col === "Submitter2_ClinSig") {
                                            return (
                                                <td key={col} style={{ padding: "10px 12px" }}>
                                                        <span className={getClinicalSignificanceBadge(value)}>
                                                            {truncateText(value, 50)}
                                                        </span>
                                                </td>
                                            );
                                        }

                                        // Special rendering for Conflict_Reported
                                        if (col === "Conflict_Reported") {
                                            return (
                                                <td key={col} style={{ padding: "10px 12px" }}>
                                                    {getConflictBadge(value)}
                                                </td>
                                            );
                                        }

                                        // Special rendering for date fields
                                        if (col.includes("date") || col.includes("Date") ||
                                            col.includes("last_evaluated") || col.includes("LastEval")) {
                                            return (
                                                <td key={col} style={{ padding: "10px 12px" }}>
                                                    {formatDate(value)}
                                                </td>
                                            );
                                        }

                                        // Special rendering for accession fields
                                        if (col === "accession" || col === "rcv_accession" ||
                                            col === "Submitter1_SCV" || col === "Submitter2_SCV") {
                                            return (
                                                <td key={col} style={{ padding: "10px 12px" }}>
                                                    <code style={{
                                                        background: "#f5f5f5",
                                                        padding: "2px 6px",
                                                        borderRadius: "3px",
                                                        fontSize: "12px"
                                                    }}>
                                                        {value || "-"}
                                                    </code>
                                                </td>
                                            );
                                        }

                                        // Special rendering for gene_symbol
                                        if (col === "gene_symbol" || col === "Gene_Symbol") {
                                            return (
                                                <td key={col} style={{ padding: "10px 12px" }}>
                                                    <strong style={{ color: "#1976d2" }}>{value || "-"}</strong>
                                                </td>
                                            );
                                        }

                                        // Special rendering for VariationID
                                        if (col === "variation_id" || col === "VariationID" ||
                                            col === "NCBI_Variation_ID") {
                                            return (
                                                <td key={col} style={{ padding: "10px 12px" }}>
                                                    <code style={{
                                                        background: "#f5f5f5",
                                                        padding: "2px 6px",
                                                        borderRadius: "3px",
                                                        fontSize: "12px"
                                                    }}>
                                                        {value || "-"}
                                                    </code>
                                                </td>
                                            );
                                        }

                                        // Special rendering for Rank_diff
                                        if (col === "Rank_diff") {
                                            return (
                                                <td key={col} style={{ padding: "10px 12px", textAlign: "center" }}>
                                                    {value ? (
                                                        <span style={{
                                                            fontWeight: "bold",
                                                            color: parseInt(value) > 1 ? "#c62828" : "#2e7d32"
                                                        }}>
                                                                {value}
                                                            </span>
                                                    ) : "-"}
                                                </td>
                                            );
                                        }

                                        // Default rendering with truncation
                                        return (
                                            <td key={col} style={{
                                                padding: "10px 12px",
                                                maxWidth: "200px",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap"
                                            }}>
                                                {typeof value === "number" ? (
                                                    value
                                                ) : (
                                                    <span title={value}>{truncateText(value, 100)}</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="dataset-pagination" style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "20px",
                        padding: "20px 0"
                    }}>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 0 || loading}
                            style={{
                                padding: "8px 16px",
                                border: "1px solid #ddd",
                                background: "white",
                                borderRadius: "4px",
                                cursor: (currentPage === 0 || loading) ? "not-allowed" : "pointer",
                                opacity: (currentPage === 0 || loading) ? 0.5 : 1
                            }}
                        >
                            ◀ Previous
                        </button>
                        <span style={{ fontSize: "14px", color: "#666" }}>
                            Page <strong>{currentPage + 1}</strong> of <strong>{totalPages}</strong>
                            <span style={{ marginLeft: "10px", color: "#999" }}>
                                ({records.length} records shown)
                            </span>
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages - 1 || loading}
                            style={{
                                padding: "8px 16px",
                                border: "1px solid #ddd",
                                background: "white",
                                borderRadius: "4px",
                                cursor: (currentPage >= totalPages - 1 || loading) ? "not-allowed" : "pointer",
                                opacity: (currentPage >= totalPages - 1 || loading) ? 0.5 : 1
                            }}
                        >
                            Next ▶
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}