import React, {useEffect, useState} from 'react';
import DB from '../contexts/DB';
import EditButton from "../modules/EditButton";

const ServicesSection = () => {
    const path = window.location.pathname.split('/')[1];
    const [block, setBlock] = useState({});
    useEffect(() => {
        const fetchData = async () => {
            const data = await DB.fetchPost(path,'b.sort asc');
            setBlock(data?.[0] ?? {});

        };
        fetchData();
    }, []);

    return (
        <section style={styles.section}>
            <div style={styles.container}>
                <div style={styles.row}>
                    <div style={styles.colLeft}>
                        <div style={styles.titleBox}>
                            <div style={styles.sectionTitle}>
                                <span>{block.title}</span>
                                <h2>Gen20</h2>
                            </div>
                            <div id={`block-${block.id}`} style={styles.description}
                               dangerouslySetInnerHTML={{__html: block.content}}>
                            </div>
                            <EditButton blockId={block.id} row="content" editable={true} lang="el"/>
                            <a href="/" style={styles.button}>Περισσότερα</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;

// ===================== STYLES =====================
const styles = {
    section: {
        padding: '60px 0',
    },
    container: {
        margin: '0 auto',
        padding: '0 15px',
    },
    row: {

    },
    colLeft: {
        flex: '0 0 33.333%',
        padding: 15,
    },
    colRight: {
        flex: '0 0 66.666%',
        padding: 15,
    },
    titleBox: {
        paddingRight: 20,
    },
    sectionTitle: {
        marginBottom: 20,
    },
    description: {
        fontSize: 16,
        lineHeight: 1.7,
        color: '#fff',
    },
    button: {
        display: 'inline-block',
        marginTop: 20,
        padding: '10px 20px',
        backgroundColor: '#ff3c00',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: 5,
    },
    colBlock: {
        flex: '0 0 50%',
        padding: 15,
    },
    serviceItem: {
        backgroundColor: '#f7f7f7',
        padding: 20,
        borderRadius: 8,
        boxShadow: '0 0 10px rgba(0,0,0,0.05)',
    },
    iconBox: {
        marginBottom: 15,
    },
    icon: {
        width: 40,
        height: 40,
    },
    title: {
        fontSize: 18,
        marginBottom: 10,
    },
    content: {
        fontSize: 14,
        color: '#555',
    },
};