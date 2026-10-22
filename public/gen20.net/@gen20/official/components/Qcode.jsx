import React from "react";
import { QRCode } from "react-qrcode-logo";

const Qcode = ({ url }) => {
    const pageUrl = url || window.location.href;

    return (
        <div className="flex flex-col items-center p-4">
            <QRCode
                value={pageUrl}
                size={150}
                qrStyle="squares"
                ecLevel="H"
                bgColor="#FFFFFF"
                fgColor="#000000"
            />
            <p className="mt-2 text-sm break-all text-gray-500">{pageUrl}</p>
        </div>
    );
};

export default Qcode;
