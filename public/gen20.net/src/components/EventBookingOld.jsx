import React, { useEffect, useState } from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import DB from "../contexts/DB";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const EventBooking = ({eventUri}) => {
    const [eventInfo, setEventInfo] = useState({
        name: "Παράσταση",
        img: "",
        description: "",
        price: "",
    });
    const [shows, setShows] = useState([]);
    const [selectedShow, setSelectedShow] = useState(null);
    const [formData, setFormData] = useState({ name: "", email: "", tel: "",quantity: 1 });
    const [formDisabled, setFormDisabled] = useState(false);
    const [formCompleted, setFormCompleted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPaypal, setShowPaypal] = useState(false);
    const [currentReservationId, setCurrentReservationId] = useState(null);
    const [remainingTickets, setRemainingTickets] = useState(0);
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setLoading(true);
                // Πρώτα παίρνουμε το title του event
                const titleQuery = `SELECT id,name, type, img, price, description FROM gen_gen20net.c_shop WHERE uri = '${eventUri}' AND type="performance" `;
                const titleData = await DB.maria("fa", titleQuery);
                if (titleData) {
                    setEventInfo(titleData);
                }
                // Φορτώνουμε shows
                const showsQuery = `
                    SELECT id, showtime, venue, max_tickets, total_booked  
                    FROM gen_gen20net.c_shop_performance 
                    WHERE shopid = ${titleData.id} 
                    ORDER BY showtime DESC
                `;
                const showsData = await DB.maria("fa", showsQuery);
                setShows(showsData || []);
            } catch (err) {
                console.error("Error fetching event data:", err);
                setShows([]);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, []);

    // 2️⃣ Υπολογισμός remainingTickets όταν αλλάζει selectedShow
    useEffect(() => {
        if (!selectedShow) return;
        setRemainingTickets(selectedShow.max_tickets - selectedShow.total_booked);
    }, [selectedShow]);
    const handleShowChange = (e) => {
        setSelectedShow(shows.find((s) => s.id === parseInt(e.target.value)));
        setFormCompleted(false);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        let result;
        const { name, email, tel, quantity, delivery_method, payment_method, address } = formData;

        if (!name || !email) {
            alert("Συμπλήρωσε τουλάχιστον όνομα και email.");
            return;
        }

        console.log(selectedShow);
        console.log(formData);

        // Δημιουργούμε το αντικείμενο για insertBlock
        const data = {
            shopid: eventInfo.id,
            name:name,
            email:email,
            tel: tel || "",
            quantity: quantity || 1,
            status:1
        };
        if(eventInfo.type==='performance'){
            data.performanceid=selectedShow.id;
            data.payment_method=payment_method;
            if (payment_method === "onsite") {
                // ✅ Απευθείας SweetAlert2 χωρίς PayPal
                const countFromDB = `
                    SELECT COALESCE(SUM(quantity),0) as count
                    FROM gen_gen20net.c_shop_order
                    WHERE performanceid = ${selectedShow.id} AND status = 2
                `;
                const dbRes = await DB.maria("f", countFromDB);
                //const spectatorCount = Number(dbRes.count || 0) + Number(quantity);
                //data.code = `S${selectedShow.id}-${spectatorCount}`;
                const sold = Number(dbRes.count || 0);
                const safeQty = Number(quantity) || 1;
                const codes = [];
                for (let i = 1; i <= safeQty; i++) {
                    codes.push(`S${selectedShow.id}-${sold + i}`);
                }
                data.code = codes.join(",");
                data.status = 2;

                result = await DB.insertBlock("gen_gen20net.c_shop_order", data);
                const updateTotDB = `UPDATE gen_gen20net.c_shop_performance SET total_booked=total_booked+${safeQty} WHERE id = ${selectedShow.id}`;
                const updateTotal = await DB.maria("q", updateTotDB);

                if(result && updateTotal) {
                    console.log('inserted & updated');
                    const MySwal = withReactContent(Swal);
                    MySwal.fire({
                        title: 'Κράτηση Ολοκληρώθηκε!',
                        text: `Η κράτησή σου αποθηκεύτηκε με κωδικό θέσης ${data.code}.`,
                        icon: 'success',
                        confirmButtonText: 'ΟΚ'
                    });
                }
            }else if (payment_method === "online") {
                setShowPaypal(true);
                result = await DB.insertBlock("gen_gen20net.c_shop_order", data);
            }
        }
        if(eventInfo.type==='book'){
            data.delivery_method=delivery_method;
            data.address=address;
            result = await DB.insertBlock("gen_gen20net.c_shop_order", data);
            if (result) {
                if (payment_method === "online") {
                    // ✅ Αν είναι online → τότε εμφανίζουμε PayPal
                    setShowPaypal(true);
                }
                console.log("Τα στοιχεία αποθηκεύτηκαν επιτυχώς!");
            } else {
                alert("Κάτι πήγε στραβά. Δοκίμασε ξανά.");
            }
        }
        setFormDisabled(true);
        setCurrentReservationId(result);
        setFormCompleted(true);
    };

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
    if (loading) return <div>Φόρτωση...</div>;
    return (
        <div style={{maxWidth: "600px",background: "var(--bg)",padding: '30px',margin: "auto"}}>
            <h2>{eventInfo.name}</h2>
            {/* Featured image */}
            {eventInfo.img && (
                <a href="/sumud">
                    <img
                        src={eventInfo.img}
                        alt={eventInfo.name}
                        style={{
                            width: "100%",
                            maxHeight: "270px",
                            borderRadius: "12px",
                            margin: "16px 0",
                            objectFit: "cover",
                            objectPosition: "top"
                        }}
                    /></a>
            )}
            {/* Summary */}
            {eventInfo.description && (
                <p style={{fontSize: "1.5em", lineHeight: "1.6"}}>
                    {eventInfo.description}
                </p>
            )}

            {/* Optional: price info */}
            {eventInfo.price && (
                <p style={{ marginTop: "8px", fontWeight: "600" }}>
                    Τιμή: {eventInfo.price} €
                </p>
            )}
            {eventInfo.type === 'performance' && shows.length > 0 && (
                <div
                    className="event-booking"
                    style={{padding: "20px", fontFamily: "sans-serif"}}
                >
                    {/* === Επιλογή παράστασης === */}
                    <div
                        style={{
                            padding: "20px",
                            borderTop: "2px solid #eee",
                        }}
                    >
                        <h3 style={{marginBottom: "15px", fontSize: "18px", fontWeight: 600}}>
                            🎭 Επιλέξτε παράσταση:
                        </h3>
                        <div style={{display: "flex", flexDirection: "column"}}>
                            {shows.map((show) => {
                                const showDate = new Date(show.showtime);
                                const now = new Date();
                                const soldOut = show.max_tickets <= show.total_booked;
                                const past = showDate < now;

                                let labelText = `${show.showtime} - ${show.venue}`;
                                if (soldOut) labelText += " ⚠️ Sold Out";
                                if (past) labelText += " ⏳ Completed";

                                return (   // <-- αυτό έλειπε
                                    <label
                                        key={show.id}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            margin: "2px",
                                            padding: "12px 16px",
                                            border: "1px solid #ddd",
                                            borderRadius: "12px",
                                            cursor: soldOut || past ? "not-allowed" : "pointer",
                                            background: soldOut || past ? "var(--bgred)" : "var(--bg2)",
                                            transition: "all 0.25s ease"
                                        }}
                                    >
                                        <input
                                            disabled={soldOut || past || formDisabled}
                                            type="radio"
                                            name="performance"
                                            value={show.id}
                                            onChange={handleShowChange}
                                            style={{
                                                width: "18px",
                                                height: "18px",
                                                accentColor: "#4b4bcc",
                                            }}
                                        />
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            <span style={{ fontSize: "1em" }}>{show.showtime}</span>
                                            <span style={{ fontSize: "1.1em" }}>{show.venue}</span>
                                            <div style={{ color: "red" }}>{labelText}</div>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
            {(selectedShow || eventInfo.type === 'book') && (
                <form onSubmit={handleFormSubmit} style={{marginTop: "20px", width: '98%'}}>
                    <h3>Στοιχεία:</h3>
                    <input
                        disabled={formDisabled}
                        type="text"
                        name="name"
                        className="gs-input"
                        placeholder="Όνομα"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        style={{display: "block", marginBottom: "10px", width: "100%"}}
                    />
                    <input
                        disabled={formDisabled}
                        type="email"
                        name="email"
                        className="gs-input"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        style={{display: "block", marginBottom: "10px", width: "100%"}}
                    />

                    <select
                        disabled={formDisabled}
                        name="payment_method"
                        className="gs-input"
                        value={formData.payment_method || ""}
                        onChange={handleInputChange}
                        required
                        style={{display: "block", marginBottom: "10px", width: "100%"}}
                    >
                        <option value="" disabled>Επιλέξτε τρόπο πληρωμής</option>
                        <option value="onsite">Στο θέατρο (30' πριν την έναρξη)</option>
                        <option value="online">Online</option>
                    </select>

                    {eventInfo.type === 'book' && (
                        <>
                            <select
                                disabled={formDisabled}
                                name="delivery_method"
                                className="gs-input"
                                value={formData.delivery_method || ""}
                                onChange={handleInputChange}
                                required
                                style={{display: "block", marginBottom: "10px", width: "100%"}}
                            >
                                <option value="" disabled>Επιλέξτε τρόπο παραλαβής</option>
                                <option value="send">Αποστολή σε διεύθυνση</option>
                                <option value="office">Παραλαβή από το γραφείο / θέατρο</option>
                            </select>

                            <input
                                disabled={formDisabled}
                                type="text"
                                name="address"
                                className="gs-input"
                                placeholder="Διεύθυνση αποστολής"
                                value={formData.address || ""}
                                onChange={handleInputChange}
                                required
                                style={{display: "block", marginBottom: "10px", width: "100%"}}
                            />
                        </>
                    )}
                    <input
                        disabled={formDisabled}
                        type="tel"
                        name="tel"
                        className="gs-input"
                        placeholder="Τηλέφωνο"
                        value={formData.tel}
                        onChange={handleInputChange}
                        style={{display: "block", marginBottom: "10px", width: "100%"}}
                    />

                    {/* Νέο input για αριθμό εισιτηρίων */}
                    <input
                        disabled={formDisabled}
                        type="number"
                        name="quantity"
                        className="gs-input"
                        min={1}
                        max={remainingTickets || 70}
                        value={formData.quantity ?? ""}
                        onChange={(e) => {
                            const val = e.target.value;
                            setFormData({
                                ...formData,
                                quantity: val === "" ? "" : Math.max(1, parseInt(val, 10) || 1),
                            });
                        }}
                        required
                        style={{display: "block", marginBottom: "10px", width: "100%"}}
                    />

                    {/* Υπολογισμός συνόλου */}
                    <p>
                        Σύνολο:{" "}
                        <strong>
                            {((formData.quantity || 1) * (eventInfo.price || 0)).toFixed(2)} €
                        </strong>
                    </p>

                    <button disabled={formDisabled}
                            style={{padding: "10px", marginBottom: "10px", background: "var(--bg2)"}}
                            type="submit">Ολοκλήρωση
                    </button>
                </form>
            )}

            {showPaypal && (
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
                                        amount: {value: ((formData.quantity || 1) * (eventInfo.price || 0)).toFixed(2)}
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
                                const safeQty = Number(formData.quantity) || 1;
                                const codes = [];
                                for (let i = 1; i <= safeQty; i++) {
                                    codes.push(`S${selectedShow.id}-${sold + i}`);
                                }
                                const spectatorCodes = codes.join(",");

// 2) Run oxygen contacts, invoice
                                const invoice = await createOxygenInvoice({ details, eventInfo, selectedShow, formData, currentReservationId });
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
            )}
        </div>
    );
};

export default EventBooking;
