import React, { useState } from "react";

const TestOxygenSection = ({ selectedShow, quantity = 1, payerDetails }) => {
    const [contact, setContact] = useState(null);
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createContact = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/v1/local/createOxygenContact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: `${payerDetails.name.given_name} ${payerDetails.name.surname}`,
                    email: payerDetails.email_address,
                    language: "el",
                }),
            });
            const data = await res.json();
            console.log("Contact created:", data);
            setContact(data);
        } catch (err) {
            console.error("Error creating contact:", err);
            setError(err.message || "Error creating contact");
        } finally {
            setLoading(false);
        }
    };

    const createInvoice = async () => {
        if (!contact) return alert("First create a contact!");
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/v1/local/createOxygenInvoice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contact_id: contact.id,
                    document_type: "s", // Invoice
                    issue_date: new Date().toISOString().split("T")[0],
                    description: `Εισιτήρια για ${selectedShow.description} (${selectedShow.showtime})`,
                    items: [
                        {
                            description: selectedShow.description,
                            quantity: quantity,
                            unit_net_value: selectedShow.price,
                            tax_id: "VAT-ID-HERE",
                        },
                    ],
                    language: "el",
                    payment_method_id: "paypal",
                }),
            });
            const data = await res.json();
            console.log("Invoice created:", data);
            setInvoice(data);
        } catch (err) {
            console.error("Error creating invoice:", err);
            setError(err.message || "Error creating invoice");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "20px", border: "1px solid #ccc" }}>
            <h3>Oxygen API Test Section</h3>
            <button onClick={createContact} disabled={loading}>
                Create Contact
            </button>
            <button
                onClick={createInvoice}
                disabled={loading || !contact}
                style={{ marginLeft: "10px" }}
            >
                Create Invoice
            </button>

            {contact && (
                <div>
                    <h4>Contact:</h4>
                    <pre>{JSON.stringify(contact, null, 2)}</pre>
                </div>
            )}

            {invoice && (
                <div>
                    <h4>Invoice:</h4>
                    <pre>{JSON.stringify(invoice, null, 2)}</pre>
                </div>
            )}

            {error && (
                <div style={{ color: "red" }}>
                    <strong>Error:</strong> {error}
                </div>
            )}
        </div>
    );
};

export default TestOxygenSection;
