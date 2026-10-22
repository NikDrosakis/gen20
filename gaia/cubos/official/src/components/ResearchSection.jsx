import React, { useEffect, useState } from "react";
import DB from "../contexts/DB";
import { useG } from "../contexts/GContext";
import EditButton from "../modules/EditButton";

const ResearchSection = ({ path, lang }) => {
    const { G } = useG();
    const [block, setBlock] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [questions, setQuestions] = useState([]);

    // Fetch research groups (θέματα)
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const data = await DB.fetchPost("c_researchgrp", "id asc");
                setGroups(Array.isArray(data) ? data : []);
                if (data?.length) setSelectedGroup(data[0].id); // Default to first group
            } catch (err) {
                console.error("Error fetching research groups:", err);
                setGroups([]);
            }
        };
        fetchGroups();
    }, []);

    // Fetch questions for selected group
    useEffect(() => {
        if (!selectedGroup) return;
        const fetchQuestions = async () => {
            try {
                const data = await DB.fetchPost(`c_research?researchgrpid=${selectedGroup}`, "id asc");
                setQuestions(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching questions:", err);
                setQuestions([]);
            }
        };
        fetchQuestions();
    }, [selectedGroup]);

    // Optional: Load block for layout/title if needed
    useEffect(() => {
        const fetchBlock = async () => {
            try {
                const data = await DB.fetchPost(path, "b.sort asc");
                setBlock(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching block data:", err);
                setBlock([]);
            }
        };
        fetchBlock();
    }, [path]);

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Έρευνα: Ποίηση & Ποιητές</h2>

            {/* Dropdown για τις θεματικές */}
            <div className="mb-6">
                <label className="mr-2 font-semibold">Επίλεξε Θέμα:</label>
                <select
                    value={selectedGroup || ""}
                    onChange={(e) => setSelectedGroup(Number(e.target.value))}
                    className="border rounded px-2 py-1"
                >
                    {groups.map((grp) => (
                        <option key={grp.id} value={grp.id}>
                            {grp.title}
                        </option>
                    ))}
                </select>
            </div>

            {/* Ερωτήσεις */}
            <div className="space-y-6">
                {questions.map((q, idx) => (
                    <div key={q.id} className="border-b pb-4">
                        <p className="font-medium mb-2">{idx + 1}. {q.question}</p>
                        <div className="space-y-2">
                            {[q.option1, q.option2, q.option3, q.option4].map((opt, i) => (
                                <label key={i} className="block">
                                    <input type="radio" name={`q_${q.id}`} value={opt} className="mr-2" />
                                    {opt}
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6">
                <EditButton />
            </div>
        </div>
    );
};

export default ResearchSection;
