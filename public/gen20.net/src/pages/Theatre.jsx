import React, { useEffect, useState } from "react";
import Breadcrumb from "../components/Breadcrumb";
import Carousel from "../components/Carousel";
import DB from "../contexts/DB";
const Theatre = () => {
    const [eventInfo, setEventInfo] = useState([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setLoading(true);
                // Πρώτα παίρνουμε το title του event
                const titleQuery = `SELECT * FROM gen_gen20net.c_shop WHERE type="performance" `;
                const titleData = await DB.maria("fa", titleQuery);
                console.log(titleData);
                if (titleData.length > 0) {
                    setEventInfo(titleData || []);
                }
            } catch (err) {
                console.error("Error fetching event data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, []);
    return (
        <div style={{boxShadow: "var(--shadow)",background: "var(--bg)",padding: '30px',margin: "auto"}}>
            <Breadcrumb/>
            <Carousel items={eventInfo} />
        </div>
    );
};
export default Theatre;