import React from "react";
import MdSection from "./MdSection";
import EventBooking from "./EventBooking";
const Book = ({path}) => {
    return (
        <>
            <EventBooking eventUri={"sumudtest"} />
            <MdSection path={"sumudtest"} />
        </>
    )
};

export default Book;