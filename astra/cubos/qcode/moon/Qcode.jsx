import { QRCode } from "react-qrcode-logo";
import "./Qcode.css";

const Qcode = ({ url }) => {
    const pageUrl = url || window.location.href;

    return (
        <div className="qcode-box">
            <QRCode
                value={pageUrl}
                size={120}
                qrStyle="squares"
                ecLevel="H"
                bgColor="#FFFFFF"
                fgColor="#000000"
            />
            <p>{pageUrl}</p>
        </div>
    );

};

export default Qcode;
