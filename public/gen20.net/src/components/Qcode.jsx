import React from "react";
import { QRCode } from "react-qrcode-logo";

const Qcode = ({ url }) => {
    const pageUrl = url || window.location.href;

    return (
        <>
            <style>{`
      @media (max-width: 1200px) {
        .qcode-box {
          display: none !important;
        }
      }
    `}</style>

            <div
                className="qcode-box"
                style={{
                    background: "none",
                    zIndex: 1000,
                    position: "absolute",
                    left: "10px",
                    maxWidth: "180px", // control width, optional
                }}
            >
                <QRCode
                    value={pageUrl}
                    size={120}
                    qrStyle="squares"
                    ecLevel="H"
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                />
                <p style={{ fontSize: "12px", wordBreak: "break-word" }}>{pageUrl}</p>
            </div>
        </>
    );

};

export default Qcode;
