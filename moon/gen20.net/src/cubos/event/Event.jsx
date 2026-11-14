import EventBoard from "./EventBoard";
const Events = ({path, lang}) => {
    return (
        <>
            <EventBoard postgrpid={33} lang={lang} />
            <EventBoard postgrpid={31} lang={lang} />
        </>
    )
};

export default Events