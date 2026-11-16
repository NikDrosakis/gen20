import { useEffect, useState } from 'react';
import { useG } from '../../GContext';
import Cookies from 'js-cookie';
import './Survey.css';

const API_BASE = '/api/v1/maria';
const escapeSql = (s = '') => String(s).replace(/'/g, "''");

const Survey = ({ path }) => {
    const { G } = useG();
    const apiKey = G?.is?.API_KEY;
    const lang = Cookies.get('lang') || 'el';
    const userid = parseInt(Cookies.get('GENUID') || '0', 10);

    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fa = async (sql, signal) => {
        const res = await fetch(
            `${API_BASE}/fa?key=${encodeURIComponent(apiKey || '')}&q=${encodeURIComponent(sql)}`,
            { signal }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return Array.isArray(data) ? data : data?.rows ?? data?.data ?? [];
    };

    const q = async (sql) => {
        const res = await fetch(`${API_BASE}/q?key=${encodeURIComponent(apiKey || '')}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sql }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    };

    useEffect(() => {
        const controller = new AbortController();
        const load = async () => {
            try {
                const rows = await fa('select * from gen_gen20net.c_researchgrp', controller.signal);
                setGroups(rows);
                if (rows.length) setSelectedGroup(rows[0].id);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error fetching research groups:', err);
                    setError(err.message);
                }
            }
        };
        load();
        return () => controller.abort();
    }, [apiKey]);

    useEffect(() => {
        if (!selectedGroup) return;
        const controller = new AbortController();
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const rows = await fa(
                    `SELECT q.*, a.answer AS user_answer
                     FROM gen_gen20net.c_research q
                              LEFT JOIN gen_gen20net.c_research_answer a
                                        ON a.researchid = q.id AND a.userid = ${userid}
                     WHERE q.researchgrpid = ${selectedGroup}`,
                    controller.signal
                );
                const answerMap = {};
                rows.forEach((row) => {
                    if (row.user_answer !== null) answerMap[row.id] = row.user_answer;
                });
                setAnswers(answerMap);
                setQuestions(rows);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error fetching questions:', err);
                    setError(err.message);
                    setQuestions([]);
                }
            } finally {
                setLoading(false);
            }
        };
        load();
        return () => controller.abort();
    }, [selectedGroup, userid, apiKey]);

    const saveAnswer = async (questionId, value) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
        try {
            await q(
                `INSERT INTO gen_gen20net.c_research_answer (researchid, userid, answer)
         VALUES (${questionId}, ${userid}, ${value})
         ON DUPLICATE KEY UPDATE answer=${value}`
            );
        } catch (err) {
            console.error('Failed to save answer:', err);
        }
    };

    if (error) return <div className="survey-state survey-state--error">Error: {error}</div>;

    return (
        <div className="survey container">
            <header className="survey__header">
                <h2 className="survey__title">Research Survey</h2>

                <div className="survey__select-wrap">
                    <label htmlFor="survey-group" className="survey__label">
                        {lang === 'el' ? 'Θεματική' : 'Topic'}
                    </label>
                    <select
                        id="survey-group"
                        className="survey__select"
                        value={selectedGroup ?? ''}
                        onChange={(e) => setSelectedGroup(Number(e.target.value))}
                    >
                        {groups.map((grp) => (
                            <option key={grp.id} value={grp.id}>
                                {grp[`title_${lang}`]} — {grp[`description_${lang}`]}
                            </option>
                        ))}
                    </select>
                </div>
            </header>

            {loading && <p className="survey-state">Loading questions…</p>}
            {!loading && !questions.length && <p className="survey-state">No questions found.</p>}

            <div className="survey__questions">
                {questions.map((item, idx) => (
                    <fieldset key={item.id} className="survey__question">
                        <legend className="survey__question-title">
                            {idx + 1}. {item[`question_${lang}`]}
                        </legend>

                        <div className="survey__options">
                            {[1, 2, 3, 4].map((i) => {
                                const opt = item[`option${i}_${lang}`];
                                const id = `q_${item.id}_${i}`;
                                return (
                                    <label key={i} htmlFor={id} className="survey__option">
                                        <input
                                            id={id}
                                            type="radio"
                                            name={`q_${item.id}`}
                                            value={i}
                                            className="survey__radio"
                                            checked={answers[item.id] === i}
                                            onChange={() => saveAnswer(item.id, i)}
                                        />
                                        <span className="survey__option-text">{opt}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </fieldset>
                ))}
            </div>
        </div>
    );
};

export default Survey;