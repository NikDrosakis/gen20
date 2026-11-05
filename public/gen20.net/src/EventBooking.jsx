import React, { useEffect, useState } from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import Checkout from "./Checkout";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import "./EventBooking.css"; // Import the CSS file

const EventBooking = ({eventUri}) => {
    const [eventInfo, setEventInfo] = useState([]);
    const [shows, setShows] = useState([]);
    const [selectedShow, setSelectedShow] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        tel: "",
        quantity: 1,
        price: 12,
        rprice: 10,
        payment_method: ""
    });
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
                // Fetch event title
                const titleQuery = `SELECT * FROM gen_gen20net.c_shop WHERE type="performance"`;
                const titleResponse = await fetch(`/api/v1/maria/fa?folder=${encodeURIComponent(titleQuery)}`);
                const titleData = await titleResponse.json();
                if (titleData.success && titleData.data) {
                    setEventInfo(titleData.data || []);
                }

                // Fetch shows
                const showsQuery = `SELECT c_shop.id as shopid, c_shop_performance.id, c_shop_performance.showtime, c_shop_performance.venue, c_shop_performance.max_tickets, c_shop_performance.total_booked, c_shop.name, c_shop.img FROM gen_gen20net.c_shop_performance LEFT JOIN gen_gen20net.c_shop on c_shop.id=c_shop_performance.shopid ORDER BY c_shop_performance.showtime DESC`;
                const showsResponse = await fetch(`/api/v1/maria/fa?folder=${encodeURIComponent(showsQuery)}`);
                const showsData = await showsResponse.json();
                setShows(showsData.success && showsData.data ? showsData.data : []);
                console.log(showsData);
            } catch (err) {
                console.error("Error fetching event data:", err);
                setShows([]);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, []);

    // Calculate remaining tickets
    useEffect(() => {
        if (!selectedShow) return;
        setRemainingTickets(selectedShow.max_tickets - selectedShow.total_booked);
    }, [selectedShow]);

    const handleShowChange = (e) => {
        const show = shows.find((s) => s.id === parseInt(e.target.value));
        setSelectedShow(show);
        setFormCompleted(false);

        setFormData((prev) => ({
            ...prev,
            shopid: show.shopid,
            venue: show.venue
        }));

        // Scroll to bottom
        setTimeout(() => {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth"
            });
        }, 50);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        let result;
        const { name, email, tel, quantity, shopid, delivery_method, payment_method, address } = formData;

        if (!name || !email) {
            alert("Συμπλήρωσε τουλάχιστον όνομα και email.");
            return;
        }

        const data = {
            shopid: shopid,
            name: name,
            email: email,
            tel: tel || "",
            quantity: quantity || 1,
            status: 1
        };

        data.performanceid = selectedShow.id;
        data.payment_method = payment_method;

        if (payment_method === "onsite") {
            // Count from DB
            const countQuery = `SELECT COALESCE(SUM(quantity),0) as count FROM gen_gen20net.c_shop_order WHERE performanceid = ${selectedShow.id} AND status = 2`;
            const countResponse = await fetch(`/api/v1/maria/f?folder=${encodeURIComponent(countQuery)}`);
            const countData = await countResponse.json();

            const sold = Number(countData.count || 0);
            const safeQty = Number(quantity) || 1;
            const codes = [];
            for (let i = 1; i <= safeQty; i++) {
                codes.push(`S${selectedShow.id}-${sold + i}`);
            }
            data.code = codes.join(",");
            data.status = 2;
            console.log(data);

            // Insert order
            const insertResponse = await fetch('/api/v1/maria/insert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    table: 'gen_gen20net.c_shop_order',
                    data: data
                })
            });
            const insertResult = await insertResponse.json();
            result = insertResult;

            // Update total
            const updateQuery = `UPDATE gen_gen20net.c_shop_performance SET total_booked=total_booked+${safeQty} WHERE id = ${selectedShow.id}`;
            const updateResponse = await fetch(`/api/v1/maria/q?folder=${encodeURIComponent(updateQuery)}`);
            const updateResult = await updateResponse.json();

            if (result && updateResult) {
                console.log('inserted & updated');
                const MySwal = withReactContent(Swal);
                MySwal.fire({
                    title: 'Κράτηση Ολοκληρώθηκε!',
                    text: `Η κράτησή σου αποθηκεύτηκε με κωδικό θέσης ${data.code}.`,
                    icon: 'success',
                    confirmButtonText: 'ΟΚ'
                });
            }
        } else if (payment_method === "online") {
            console.log(data);
            setShowPaypal(true);

            // Insert order
            const insertResponse = await fetch('/api/v1/maria/insert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    table: 'gen_gen20net.c_shop_order',
                    data: data
                })
            });
            const insertResult = await insertResponse.json();
            result = insertResult;

            console.log("CHECK condition =>",
                currentReservationId,
                selectedShow,
                formData.payment_method
            );
        }

        setFormDisabled(true);
        console.log(result);
        setCurrentReservationId(result);
        setFormCompleted(true);
    };

    if (loading) return <div className="event-booking-loading">Φόρτωση...</div>;

    return (
        <div className="event-booking-wrapper">
            {/* Shows List */}
            {shows.length > 0 && (
                <div className="event-booking-shows">
                    <h3 className="event-booking-shows-title">🎭 Επιλέξτε παράσταση:</h3>
                    <div className="event-booking-shows-list">
                        {shows.map((show) => {
                            const showDate = new Date(show.showtime);
                            const now = new Date();
                            const soldOut = show.max_tickets <= show.total_booked;
                            const past = showDate < now;
                            const dayName = showDate.toLocaleDateString("el-GR", {
                                weekday: "long"
                            });

                            return (
                                <label
                                    key={show.id}
                                    className={`event-booking-show-item ${
                                        soldOut || past ? 'disabled' : ''
                                    }`}
                                >
                                    <input type="hidden" name="shopid" value={show.shopid} />
                                    <input
                                        disabled={soldOut || past || formDisabled}
                                        type="radio"
                                        name="performance"
                                        value={show.id}
                                        onChange={handleShowChange}
                                        className="event-booking-radio"
                                    />
                                    <img
                                        width="100"
                                        src={show.img}
                                        alt={show.name}
                                        className="event-booking-show-image"
                                    />
                                    <div className="event-booking-show-details">
                                        <span className="event-booking-show-date">{dayName} {show.showtime}</span>
                                        <span className="event-booking-show-venue">{show.venue}</span>
                                        <div className="event-booking-show-status">
                                            {soldOut && "⚠️ Sold Out"}
                                            {past && "⏳ Completed"}
                                        </div>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Booking Form */}
            {selectedShow && (
                <div className="event-booking-form-wrapper">
                    <form onSubmit={handleFormSubmit} className="event-booking-form">
                        <h3 className="event-booking-form-title">Στοιχεία:</h3>

                        <input
                            disabled={formDisabled}
                            type="text"
                            name="name"
                            className="event-booking-input"
                            placeholder="Όνομα"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />

                        <input
                            disabled={formDisabled}
                            type="email"
                            name="email"
                            className="event-booking-input"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />

                        <select
                            disabled={formDisabled}
                            name="payment_method"
                            className="event-booking-select"
                            value={formData.payment_method || ""}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="" disabled>Επιλέξτε τρόπο πληρωμής</option>
                            <option value="onsite">Στο θέατρο (30' πριν την έναρξη)</option>
                            <option value="online">Online</option>
                        </select>

                        <input
                            disabled={formDisabled}
                            type="tel"
                            name="tel"
                            className="event-booking-input"
                            placeholder="Τηλέφωνο"
                            value={formData.tel}
                            onChange={handleInputChange}
                        />

                        <input type="hidden" name="shopid" value={formData.shopid} />

                        <input
                            disabled={formDisabled}
                            type="number"
                            name="quantity"
                            className="event-booking-input"
                            min={1}
                            max={remainingTickets || 70}
                            value={String(formData.quantity ?? "")}
                            onChange={(e) => {
                                const raw = e.target.value;
                                if (raw === "") {
                                    setFormData({ ...formData, quantity: "" });
                                    return;
                                }
                                const val = parseInt(raw, 10);
                                setFormData({
                                    ...formData,
                                    quantity: isNaN(val) ? 1 : Math.max(1, val),
                                });
                            }}
                            required
                        />

                        <p className="event-booking-total">
                            Σύνολο:
                            <strong>{(formData.quantity * Number(formData.price || 12)).toFixed(2)} €</strong>
                        </p>

                        <button
                            disabled={formDisabled}
                            className="event-booking-submit"
                            type="submit"
                        >
                            Ολοκλήρωση
                        </button>
                    </form>

                    {currentReservationId && selectedShow && (
                        <Checkout
                            details={formData}
                            selectedShow={selectedShow}
                            quantity={formData.quantity}
                            price={formData.price}
                            rprice={formData.rprice}
                            currentReservationId={currentReservationId}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default EventBooking;