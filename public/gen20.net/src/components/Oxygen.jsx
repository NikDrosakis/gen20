import React from "react";
import DB from "../contexts/DB";

const OxygenInvoice = ({
                           details, // αποτέλεσμα PayPal onApprove: actions.order.capture()
                           eventInfo,
                           selectedShow,
                           formData,
                           currentReservationId
                       }) => {
    const token = "gen20";
    const createOxygenInvoice = async () => {
        try {
            // 1️⃣ Δημιουργία contact
            const contactData = {
                name: details.payer.name.given_name + " " + details.payer.name.surname,
                email: details.payer.email_address,
                language: "el"
            };

            const contactRes = await fetch("https://sandbox-api.oxygen.gr/v1/contacts", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    //"Authorization": `Bearer ${process.env.OXYGEN_API_KEY}`
                },
                body: JSON.stringify(contactData)
            });
            const contact = await contactRes.json();

            // 2️⃣ Δημιουργία invoice
            const invoiceData = {
                contact_id: contact.id,
                description: `Εισιτήρια για ${eventInfo.name} (${selectedShow.showtime})`,
                amount: parseFloat((formData.tickets * eventInfo.price).toFixed(2)),
                language: "el"
            };

            const invoiceRes = await fetch("https://sandbox-api.oxygen.gr/v1/invoices", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    //"Authorization": `Bearer ${process.env.OXYGEN_API_KEY}`
                },
                body: JSON.stringify(invoiceData)
            });

            const invoice = await invoiceRes.json();
            console.log("Oxygen invoice created:", invoice);

            // 3️⃣ Ενημέρωση DB
            const countFromDB = await DB.maria("f", `
                SELECT COUNT(*) as count
                FROM gen_gen20net.c_event_order
                WHERE showid = ${selectedShow.id} AND status = 2
            `);

            const spectatorCount = (countFromDB[0]?.count || 0) + 1;
            const spectatorCode = `S${selectedShow.id}-${spectatorCount}`;

            await DB.maria("q", `
                UPDATE gen_gen20net.c_event_order
                SET status = 2,
                    code = '${spectatorCode}',
                    orderid = '${details.id}',
                    ordername = '${details.payer.name.given_name} ${details.payer.name.surname}',
                    ordermail = '${details.payer.email_address}',
                    purchased = '${details.create_time.replace("T", " ").replace("Z", "")}',
                    oxygen_invoice_id = '${invoice.id}'
                WHERE id = '${currentReservationId}'
            `);

            return { spectatorCode, invoice };
        } catch (err) {
            console.error("Error creating Oxygen invoice:", err);
            throw err;
        }
    };

    return (
        <button
            onClick={async () => {
                try {
                    const { spectatorCode, invoice } = await createOxygenInvoice();
                    alert(`Επιτυχία! Κωδικός θέσης: ${spectatorCode}. Το τιμολόγιο δημιουργήθηκε στο Oxygen.`);
                } catch (err) {
                    alert("Σφάλμα κατά τη δημιουργία του τιμολογίου στο Oxygen.");
                }
            }}
            style={{
                padding: "10px 20px",
                backgroundColor: "#4b4bcc",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                marginTop: "20px"
            }}
        >
            Ολοκλήρωση Oxygen Invoice
        </button>
    );
};

export default OxygenInvoice;
