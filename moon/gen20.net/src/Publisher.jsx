import React from "react";
import MdSection from "../components/MdSection";
import EventBoard from "../components/EventBoard";
import Breadcrumb from "../components/Breadcrumb";
import EventBooking from "../components/EventBooking";
const Publisher = ({path, lang}) => {
    return (
        <>
            <Breadcrumb/>
            <EventBooking eventUri={"sumudbook"} />
            
        </>
    )
};

export default Publisher;