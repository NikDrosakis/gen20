import React, { useEffect, useState } from "react";
import DB from "../contexts/DB";
import { useG } from "../contexts/GContext";
import EditButton from "../modules/EditButton";
import Cookies from "js-cookie";

const ResearchSection = ({ path}) => {
    const { G } = useG();
    const [answers, setAnswers] = useState({});
    const [block, setBlock] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [questions, setQuestions] = useState([]);
    const lang= Cookies.get('lang') || 'el';
    const rawUserId = Cookies.get('GENUID') || '0';
    const userid = parseInt(rawUserId, 10);
    const [groups, setGroups] = useState([]);
    // Fetch research groups (θέματα)
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await DB.maria('fa', 'select * from gen_gen20net.c_researchgrp');
                console.log(res)
                setGroups(Array.isArray(res) ? res : []);
                if (res?.length) setSelectedGroup(res[0].id); // Default to first group
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
                const data = await DB.maria('fa', `
                SELECT
                    q.*,
                    a.answer as user_answer
                FROM gen_gen20net.c_research q
                LEFT JOIN gen_gen20net.c_research_answer a
                    ON a.researchid = q.id AND a.userid = ${userid}
                WHERE q.researchgrpid = ${selectedGroup}
            `);

                const answerMap = {};
                data.forEach(row => {
                    if (row.user_answer !== null) {
                        answerMap[row.id] = row.user_answer;
                    }
                });
                setAnswers(answerMap);
                setQuestions(data);
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
        <div className="container">
            <div className="row">
                <div className="p-4">
                    <h2 className="text-xl font-semibold mb-4">
                    {/* Dropdown για τις θεματικές */}
                    <div className="mb-6">
                        <select
                            value={selectedGroup || 1}
                            onChange={(e) => setSelectedGroup(Number(e.target.value))}
                            className="bare border rounded px-2 py-1"
                        >
                            {groups.map((grp) => (
                                <option key={grp.id} value={grp.id}>
                                    {grp[`title_${lang}`]}: {grp[`description_${lang}`]}
                                </option>
                            ))}
                        </select>
                    </div>
                    </h2>
                </div>
                {/* Ερωτήσεις */}
                <div className="row">
                    <div className="space-y-6">
                        {questions.map((q, idx) => (
                            <div key={q.id} className="cubo border-b pb-4">
                                <p className="font-medium mb-2">
                                    {idx + 1}. {q[`question_${lang}`]}
                                </p>
                                <div className="space-y-2">
                                    {[1, 2, 3, 4].map(i => {
                                        const opt = q[`option${i}_${lang}`];
                                        return (
                                            <label key={i} className="block">
                                                <input
                                                    type="radio"
                                                    name={`q_${q.id}`}
                                                    value={i}
                                                    className="gs-input mr-2"
                                                    checked={answers[q.id] === i}
                                                    onChange={async () => {
                                                        setAnswers(prev => ({...prev, [q.id]: i}));
                                                        try {
                                                            await DB.maria('q', `
        INSERT INTO gen_gen20net.c_research_answer (researchid, userid, answer)
        VALUES (${q.id}, ${userid}, ${i})
        ON DUPLICATE KEY UPDATE answer=${i}
      `);
                                                        } catch (err) {
                                                            console.error('Failed to save answer:', err);
                                                        }
                                                    }}
                                                />
                                                {opt}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6">
                        <EditButton/>
                    </div>

            </div>
        </div>
        </div>
    );
};

export default ResearchSection;
