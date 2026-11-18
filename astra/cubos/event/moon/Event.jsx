import EventBoard from "./EventBoard";

export const Event = ({ classificationid = 100, lang = "el" }) => {
    return (
        <EventBoard
            classificationid={classificationid}
            lang={lang}
        />
    );
};