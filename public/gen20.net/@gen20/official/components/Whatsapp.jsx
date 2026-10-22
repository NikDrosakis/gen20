import React from "react";

const WhatsApp = ({ phoneNumber = "+306945031693" /* βάλε το δικό σου */, message = "Γεια σας, θέλω να επικοινωνήσω με την Gen20" }) => {
    // Κωδικοποίηση του μηνύματος για URL
    const encodedMessage = encodeURIComponent(message);

    // Σύνδεσμος WhatsApp API
    const waLink = `https://wa.me/${phoneNumber.replace(/\D/g, "")}?text=${encodedMessage}`;

    return (
        <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
            aria-label="Επικοινωνία μέσω WhatsApp"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                aria-hidden="true"
            >
                <path d="M20.52 3.48A11.872 11.872 0 0012.03.003 11.966 11.966 0 001.54 11.495c0 2.09.545 4.14 1.58 5.94L.01 23.49l6.18-1.61a11.903 11.903 0 005.85 1.47h.004c6.62 0 12-5.38 12-12 0-3.2-1.25-6.2-3.52-8.87zm-8.46 17.01a9.947 9.947 0 01-5.11-1.45l-.37-.22-3.7.96.99-3.6-.24-.37a9.96 9.96 0 0116.67-9.8 9.92 9.92 0 01-8.3 13.57zm5.18-7.6c-.28-.14-1.66-.82-1.92-.91-.26-.1-.45-.14-.64.14-.19.28-.74.9-.9 1.09-.17.18-.34.2-.62.07-.28-.14-1.17-.43-2.23-1.38-.82-.72-1.38-1.61-1.54-1.89-.16-.28-.02-.43.13-.57.13-.12.28-.3.42-.45.14-.15.19-.25.28-.42.09-.17.04-.32-.02-.46-.06-.14-.63-1.52-.86-2.07-.23-.54-.46-.47-.64-.48-.16-.01-.35-.01-.54-.01-.19 0-.5.07-.76.32-.26.25-1 1-1 2.43 0 1.43 1.03 2.81 1.17 3 .14.19 2.02 3.08 4.9 4.32.68.29 1.21.46 1.62.59.68.22 1.3.19 1.79.11.55-.1 1.66-.68 1.9-1.33.24-.64.24-1.19.17-1.33-.07-.14-.26-.23-.54-.37z" />
            </svg>
            <span>WhatsApp</span>
        </a>
    );
};

export default WhatsApp;
