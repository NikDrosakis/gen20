// pages/Page.jsx
import { useParams } from "react-router-dom";
import ContentOne from "./ContentOne";

export default function Page() {
    const { id } = useParams();

    return (
        <div className="page-container">
            <ContentOne pageId={id} />
        </div>
    );
}