import React from "react";
import HeroSection from "../components/HeroSection";
import Qcode from "../components/Qcode";
import ResearchSection from "../components/ResearchSection";
const Research = ({path}) => {
    return (
        <>
            <HeroSection path={path}/>
            <Qcode path={path}/>
            <ResearchSection path={path}/>
        </>
    );
};

export default Research;