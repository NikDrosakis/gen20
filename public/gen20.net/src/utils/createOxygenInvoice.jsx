import React from "react";
const createOxygenInvoice = async ({ details, eventInfo, selectedShow, formData, currentReservationId }) => {
    const username = 'nikos';
    const password = '130177';
    try {
        // 1️⃣ Δημιουργία contact
        const contactRes = await fetch("/api/v1/local/createOxygenContact", {
            method: "POST",
            headers: {
                'Authorization': 'Basic ' + btoa(`${username}:${password}`)
                //"Authorization": `Bearer ${process.env.OXYGEN_API_KEY}`
            },
            body: JSON.stringify({
                name: details.payer.name.given_name + " " + details.payer.name.surname,
                email: details.payer.email_address,
                language: "el"
            })
        });
        const contact = await contactRes.json();

        // 2️⃣ Δημιουργία invoice
        const invoiceRes = await fetch("/api/v1/local/createOxygenInvoice", {
            method: "POST",
            headers: {
                'Authorization': 'Basic ' + btoa(`${username}:${password}`)
                //"Authorization": `Bearer ${process.env.OXYGEN_API_KEY}`
            },
            body: JSON.stringify({
                contact_id: contact.id,
                description: `Εισιτήρια για ${eventInfo.name} (${selectedShow.showtime})`,
                amount: parseFloat((formData.quantity * eventInfo.price).toFixed(2)),
                language: "el"
            })
        });
        const invoice = await invoiceRes.json();
        return invoice;
    } catch (err) {
        console.error("Error creating Oxygen invoice:", err);
        throw err;
    }
};

export default createOxygenInvoice;