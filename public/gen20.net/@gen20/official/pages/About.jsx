import React from "react";
import AboutSection from "../components/AboutSection";
import TeamSection from "../components/TeamSection";
import Breadcrumb from "../components/Breadcrumb";
const About = ({path,lang}) => {
    return  (
        <>
            <Breadcrumb/>
            <AboutSection path={path} lang={lang}/>
            {/* <section className="counter">
                <div className="container">
            <CounterBox number={57} title="Ημέρες Λειτουργίας" />
            <CounterBox number={10} title="Ανοιχτά Project" />
                    </div>
                    </section> */}
            <TeamSection path={path}/>
        </>
    );
};

export default About;