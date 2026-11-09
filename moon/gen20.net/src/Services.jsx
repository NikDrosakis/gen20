import React from "react";
import CallToAction from "../components/CallToAction";
import LogoBegin from "../components/LogoBegin";
import Breadcrumb from "../components/Breadcrumb";
const Services = () => {
    return  (
        <>
            <Breadcrumb/>
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
            <CallToAction/>
            <LogoBegin/>
        </>
    )
};

export default Services;