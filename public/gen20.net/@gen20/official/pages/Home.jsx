import React from "react";
import TeamSection from "../components/TeamSection";
import HeroSection from "../components/HeroSection";
import HomeSection from "../components/HomeSection";
const Home = ({path}) => {
    return (
        <>
            <HeroSection path={path}/>
            <HomeSection path={path}/>
            {/* <ServicesSection /> */}
            {/* <WorkSection /> */}
            {/* <SectionBegin /> */}
            {/* <AboutSection /> */}
            {/*<LatestBlog path={path}/> */}
            <TeamSection path={path}/>
            {/* <ActionSection /> */}
        </>
    );
};

export default Home;