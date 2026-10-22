import React from "react";
import MdSection from "../components/MdSection";
import EventBooking from "../components/EventBooking";
const Book = ({path}) => {
    return (
        <>
            <EventBooking eventUri={"sumudtest"} />
            <MdSection path={"sumudtest"} />
        </>
    )
};

export default Book;