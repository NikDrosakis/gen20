import React, { useState } from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import DB from "../contexts/DB";
import CreateOxygenInvoice from "../utils/CreateOxygenInvoice";

const Checkout = ({
                      details,
                      selectedShow,
                      quantity = 1,
                      currentReservationId,
                      onSuccess,
                      onError
                  }) => {

    const [processing, setProcessing] = useState(false);
    const totalAmount = ((quantity || 1) * (details.price || 0)).toFixed(2);
    // Add validation
    if (!currentReservationId) {
        return <div>Παρακαλώ περιμένετε...</div>;
    }
    const handlePaymentSuccess = async (details) => {
        setProcessing(true);
        try {
            const countFromDB = `
        SELECT COALESCE(SUM(quantity),0) as count
        FROM gen_gen20net.c_shop_order
        WHERE performanceid = ${selectedShow.id} AND status = 2
      `;
            const dbRes = await DB.maria("f", countFromDB);
            const sold = Number(dbRes.count || 0);
            const safeQty = Number(quantity) || 1;
            const codes = [];
            for (let i = 1; i <= safeQty; i++) {
                codes.push(`S${selectedShow.id}-${sold + i}`);
            }
            const spectatorCodes = codes.join(",");

            // Εκτύπωση invoice
            const invoice = await CreateOxygenInvoice({ details, selectedShow, safeQty, currentReservationId });

            // Ενημέρωση παραγγελίας
            const orderQuery = `
        UPDATE gen_gen20net.c_shop_order
        SET status = 2,
            code = '${spectatorCodes}',
            orderid = '${details.id}',
            ordername = '${details.payer.name.given_name} ${details.payer.name.surname}',
            ordermail = '${details.payer.email_address}',
            oxygen_invoice_id = '${invoice.id}',
            purchased= '${details.create_time.replace("T", " ").replace("Z", "")}'
        WHERE id = '${currentReservationId}'
      `;
            await DB.maria("q", orderQuery);

            // Ενημέρωση total booked
            const updateTotDB = `UPDATE gen_gen20net.c_shop_performance SET total_booked=total_booked+${safeQty} WHERE id = ${selectedShow.id}`;
            await DB.maria("q", updateTotDB);

            const MySwal = withReactContent(Swal);
            MySwal.fire({
                title: 'Επιτυχία!',
                text: `Η καταχώρηση και η πληρωμή ολοκληρώθηκε με κωδικό/κωδικούς θέσης ${spectatorCodes}`,
                icon: 'success',
                confirmButtonText: 'ΟΚ'
            });

            if (onSuccess) onSuccess({ details, codes: spectatorCodes });
        } catch (err) {
            console.error("Checkout success handling error:", err);
            if (onError) onError(err);
            alert("Σφάλμα κατά την ολοκλήρωση της παραγγελίας.");
        } finally {
            setProcessing(false);
        }
    };

    const handlePaymentError = (err) => {
        console.error("Payment error:", err);
        if (onError) onError(err);
        alert("Η πληρωμή απέτυχε. Δοκίμασε ξανά.");
    };

    return (
        <div style={{ marginTop: "20px" }}>
                <>
                    <PayPalScriptProvider options={{
                        "client-id": "AduilDicu9870dr_6BKMErWYllDAhowqhMMXNsDXeaBBGu6Ixs7iDqCpDWfA0bqI9HuNCEnyCuXEsVdL",
                        currency: "EUR",
                        locale: "el_GR"
                    }}>
                        <PayPalButtons
                            createOrder={(data, actions) => {
                                return actions.order.create({
                                    purchase_units: [{
                                        amount: { value: totalAmount }
                                    }]
                                });
                            }}
                            onApprove={async (data, actions) => {
                                const details = await actions.order.capture();
                                console.log("✅ Success:", details);
                                const countFromDB = `
                                    SELECT COALESCE(SUM(quantity),0) as count
                                    FROM gen_gen20net.c_shop_order
                                    WHERE performanceid = ${selectedShow.id} AND status = 2`;
                                const dbRes = await DB.maria("f", countFromDB);
                                const sold = Number(dbRes.count || 0);
                                const safeQty = Number(quantity) || 1;
                                const codes = [];
                                for (let i = 1; i <= safeQty; i++) {
                                    codes.push(`S${selectedShow.id}-${sold + i}`);
                                }
                                const spectatorCodes = codes.join(",");

// 2) Run oxygen contacts, invoice
                                const invoice = await CreateOxygenInvoice({ details, selectedShow, quantity, currentReservationId });
                                console.log("Invoice=>",invoice);
// 3) Ενημέρωση παραγγελίας μετά PayPal, oxygen
                                const orderQuery = `
                                    UPDATE gen_gen20net.c_shop_order
                                    SET status = 2,
                                        code = '${spectatorCodes}',
                                        orderid = '${details.id}',
                                        ordername = '${details.payer.name.given_name} ${details.payer.name.surname}',
                                        ordermail = '${details.payer.email_address}',
                                        oxygen_invoice_id = '${invoice.id}',
                                        purchased= '${details.create_time.replace("T", " ").replace("Z", "")}'                                        
                                    WHERE id = '${currentReservationId}'
                                `;
                                console.log(orderQuery);
                                const orderQueryTransaction = await DB.maria("q", orderQuery);

                                if(orderQueryTransaction) {

                                    const updateTotDB = `UPDATE gen_gen20net.c_shop_performance SET total_booked=total_booked+${safeQty} WHERE id = ${selectedShow.id}`;
                                    const updateTotal = await DB.maria("q", updateTotDB);

                                    const MySwal = withReactContent(Swal);
                                    MySwal.fire({
                                        title: 'Επιτυχία!',
                                        text: `Ευχαριστούμε! Η καταχώρηση και η πληρωμή σου ολοκληρώθηκε με κωδικό/κωδικούς θέσης ${spectatorCodes}`,
                                        icon: 'success',
                                        confirmButtonText: 'ΟΚ'
                                    });
                                    console.log(`Η πληρωμή ολοκληρώθηκε `);
                                }else{
                                    console.log(invoice);
                                    alert("Ανέφικτη Συναλλαγή");
                                }
                            }}
                            onError={(err) => {
                                console.error("❌ Payment error:", err);
                                const orderQuery = `UPDATE gen_gen20net.c_shop_order SET status=0 WHERE id = '${currentReservationId}'`;
                                alert("Η πληρωμή απέτυχε. Δοκίμασε ξανά.");
                            }}
                        />
                    </PayPalScriptProvider>
                </>
        </div>
    );
};
export default Checkout;