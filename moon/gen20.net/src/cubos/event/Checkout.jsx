import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

const API = "/api/v1/maria";
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "";

const esc = (v) => String(v ?? "").replace(/\\/g, "\\\\").replace(/'/g, "''");

async function apiF(sql) {
    const res = await fetch(`${API}/f?key=${encodeURIComponent(sql)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data ?? null;
}

async function apiQ(sql) {
    const res = await fetch(`${API}/q?key=${encodeURIComponent(sql)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
}

const Checkout = ({ selectedShow, quantity = 1, price = 0, currentReservationId, onSuccess, onError }) => {
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const totalAmount = (qty * Number(price || 0)).toFixed(2);

    const confirmOrder = async (paypalDetails) => {
        // 1) Κωδικοί θέσεων
        const countQuery = `
            SELECT COALESCE(SUM(quantity), 0) AS count
            FROM gen_gen20net.c_event_order
            WHERE performanceid = ${selectedShow.performanceid} AND status = 2
        `;
        const row = await apiF(countQuery);
        const sold = Number(row?.count || 0);
        const codes = [];
        for (let i = 1; i <= qty; i++) codes.push(`S${selectedShow.performanceid}-${sold + i}`);
        const spectatorCodes = codes.join(",");

        const orderName = [paypalDetails?.payer?.name?.given_name, paypalDetails?.payer?.name?.surname]
            .filter(Boolean)
            .join(" ");
        const orderMail = paypalDetails?.payer?.email_address || "";
        const purchased = (paypalDetails?.create_time || "")
            .replace("T", " ")
            .replace("Z", "");

        // 2) Ολοκλήρωση παραγγελίας
        await apiQ(`
            UPDATE gen_gen20net.c_event_order
            SET status = 2,
                code = '${esc(spectatorCodes)}',
                orderid = '${esc(paypalDetails?.id)}',
                ordername = '${esc(orderName)}',
                ordermail = '${esc(orderMail)}',
                purchased = '${esc(purchased)}'
            WHERE id = ${currentReservationId}
        `);

        // 3) Ενημέρωση διαθεσιμότητας
        await apiQ(`
            UPDATE gen_gen20net.c_event_performance
            SET total_booked = total_booked + ${qty}
            WHERE id = ${selectedShow.performanceid}
        `);

        return codes;
    };

    return (
        <div className="event-checkout">
            <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID, currency: "EUR", locale: "el_GR" }}>
                <PayPalButtons
                    createOrder={(data, actions) =>
                        actions.order.create({
                            purchase_units: [{ amount: { value: totalAmount } }],
                        })
                    }
                    onApprove={async (data, actions) => {
                        try {
                            const details = await actions.order.capture();
                            const codes = await confirmOrder(details);
                            if (onSuccess) onSuccess(codes);
                        } catch (err) {
                            console.error("Payment/confirm error:", err);
                            if (onError) onError(err);
                        }
                    }}
                    onError={(err) => {
                        console.error("PayPal error:", err);
                        if (onError) onError(err);
                    }}
                />
            </PayPalScriptProvider>
        </div>
    );
};

export default Checkout;
