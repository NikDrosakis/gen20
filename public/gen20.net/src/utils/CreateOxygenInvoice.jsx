import React from "react";
const CreateOxygenInvoice = async ({ details, selectedShow, quantity, currentReservationId }) => {
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
console.log('contact=>',contact)


        const invoicePayload = {
            document_type: "s (Invoice for Services)",
            language: "el",
            discount_type: "0%",
            net_amount: 5,
            vat_amount: 5,
            issue_date: new Date().toISOString().slice(0, 10),
            numbering_sequence_id: "default",
            payment_method_id: "paypal",
            description: `Εισιτήρια για ${selectedShow.venue} (${selectedShow.showtime})`,
            contact_id: contact.id,
            is_paid: true,
            items: [
                {
                    description: `Εισιτήριο ${selectedShow.venue}`,
                    quantity,
                    document_type: "s (Invoice for Services)",
                    unit_net_value: Number(details.price),
                    tax_id: "0",
                    measurement_unit_id: "pcs",
                    discount_type: "percent",
                    discount_value: 0,
                    payment_method_id: "1PG313405R726672V",
                    issue_date: "2026-01-20",
                }
            ]
        };

        // 2️⃣ Δημιουργία invoice
        const invoiceRes = await fetch("/api/v1/local/createOxygenInvoice", {
            method: "POST",
            headers: {
                'Authorization': 'Basic ' + btoa(`${username}:${password}`)
            },
            body: JSON.stringify(invoicePayload)
        });

        const invoice = await invoiceRes.json();
        return invoice;
    } catch (err) {
        console.error("Error creating Oxygen invoice:", err);
        throw err;
    }
};

export default CreateOxygenInvoice;