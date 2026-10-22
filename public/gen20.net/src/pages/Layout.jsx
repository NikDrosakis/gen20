import React from "react";
import TeamSection from "../components/TeamSection";
import Breadcrumb from "../components/Breadcrumb";
import LayoutMain from "../components/LayoutMain";
const Layout = ({path,lang}) => {
    return  (
        <>
            <Breadcrumb/>
            <LayoutMain/>
            <TeamSection />
        </>
    );
};

export default Layout;