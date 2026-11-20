import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import Checkout from "./Checkout";
import "./EventBooking.css";

const API = "/api/v1/maria";

async function apiFa(sql) {
    const res = await fetch(`${API}/fa?key=${encodeURIComponent(sql)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data ?? [];
}

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

async function apiInsert(table, data) {
    const res = await fetch(`${API}/insert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table, data }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data ?? json.val ?? null;
}

const EventBooking = ({ classificationid = 100, lang = "el", onClose }) => {
    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedShow, setSelectedShow] = useState(null);
    const [remainingTickets, setRemainingTickets] = useState(0);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        tel: "",
        quantity: 1,
        payment_method: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState(null);

    const loadShows = useCallback(async () => {
        try {
            setLoading(true);
            const id = Number(classificationid);
            const query = `
                SELECT
                    p.id            AS performanceid,
                    p.contentid,
                    p.legacy_shopid,
                    p.showtime,
                    p.venue,
                    p.price,
                    p.price_reduced,
                    p.max_tickets,
                    p.total_booked,
                    c.title         AS event_title,
                    c.img           AS event_img
                FROM gen_gen20net.c_event_performance p
                LEFT JOIN gen_gen20net.content c ON c.id = p.contentid
                WHERE c.classificationid = ${id}
                ORDER BY p.showtime ASC
            `;
            const rows = await apiFa(query);
            setShows(rows || []);
        } catch (err) {
            console.error("Error fetching performances:", err);
            setShows([]);
        } finally {
            setLoading(false);
        }
    }, [classificationid]);

    useEffect(() => {
        loadShows();
    }, [loadShows]);

    useEffect(() => {
        if (!selectedShow) {
            setRemainingTickets(0);
            return;
        }
        const remaining = (selectedShow.max_tickets || 0) - (selectedShow.total_booked || 0);
        setRemainingTickets(Math.max(0, remaining));
    }, [selectedShow]);

    const handleShowChange = (e) => {
        const show = shows.find((s) => s.performanceid === parseInt(e.target.value, 10));
        setSelectedShow(show || null);
        setCurrentOrderId(null);
        setFormData((prev) => ({ ...prev, payment_method: "" }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const buildSeatCodes = async (performanceid, quantity) => {
        const query = `
            SELECT COALESCE(SUM(quantity), 0) AS count
            FROM gen_gen20net.c_event_order
            WHERE performanceid = ${performanceid} AND status = 2
        `;
        const row = await apiF(query);
        const sold = Number(row?.count || 0);
        const codes = [];
        for (let i = 1; i <= quantity; i++) {
            codes.push(`S${performanceid}-${sold + i}`);
        }
        return codes;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, email, tel, quantity, payment_method } = formData;

        if (!name || !email) {
            Swal.fire({ icon: "warning", title: "Λείπουν στοιχεία", text: "Συμπλήρωσε τουλάχιστον όνομα και email." });
            return;
        }
        if (!payment_method) {
            Swal.fire({ icon: "warning", title: "Τρόπος πληρωμής", text: "Επίλεξε τρόπο πληρωμής." });
            return;
        }

        const qty = Math.max(1, parseInt(quantity, 10) || 1);
        const price = Number(selectedShow.price || 0);

        // Κωδικοί θέσεων ΠΡΙΝ το insert — αλλιώς το νέο order (status=2) θα μετρηθεί μόνο του
        const codes =
            payment_method === "onsite"
                ? await buildSeatCodes(selectedShow.performanceid, qty)
                : [];

        const order = {
            contentid: selectedShow.contentid,
            legacy_shopid: selectedShow.legacy_shopid || 1,
            legacy_performanceid: selectedShow.performanceid,
            performanceid: selectedShow.performanceid,
            name,
            email,
            tel: tel || "",
            delivery_method: "office",
            payment_method,
            quantity: qty,
            price,
            price_total: price * qty,
            code: codes.length ? codes.join(",") : null,
            status: payment_method === "onsite" ? 2 : 1,
        };

        setSubmitting(true);
        try {
            const insertedId = await apiInsert("gen_gen20net.c_event_order", order);
            if (!insertedId) throw new Error("insert returned no id");

            if (payment_method === "onsite") {
                await apiQ(
                    `UPDATE gen_gen20net.c_event_performance SET total_booked = total_booked + ${qty} WHERE id = ${selectedShow.performanceid}`
                );
                await loadShows();
                setSelectedShow(null);
                setFormData({ name: "", email: "", tel: "", quantity: 1, payment_method: "" });
                Swal.fire({
                    icon: "success",
                    title: "Κράτηση ολοκληρώθηκε!",
                    text: `Κωδικοί θέσεων: ${codes.join(", ")}`,
                    confirmButtonText: "ΟΚ",
                });
            } else {
                // online: ολοκληρώνεται στο Checkout (PayPal)
                setCurrentOrderId(insertedId);
            }
        } catch (err) {
            console.error("Booking error:", err);
            Swal.fire({ icon: "error", title: "Σφάλμα", text: "Δεν ήταν δυνατή η κράτηση. Δοκίμασε ξανά." });
        } finally {
            setSubmitting(false);
        }
    };

    const handleOnlineSuccess = async (codes) => {
        await loadShows();
        setSelectedShow(null);
        setCurrentOrderId(null);
        setFormData({ name: "", email: "", tel: "", quantity: 1, payment_method: "" });
        Swal.fire({
            icon: "success",
            title: "Επιτυχία!",
            text: `Η πληρωμή ολοκληρώθηκε. Κωδικοί θέσεων: ${codes.join(", ")}`,
            confirmButtonText: "ΟΚ",
        });
    };

    if (loading) return <div className="event-booking-loading">Φόρτωση...</div>;

    const totalPrice = (Number(formData.quantity || 0) * Number(selectedShow?.price || 0)).toFixed(2);

    return (
        <div className="event-booking-wrapper">
            <div className="event-booking-header">
                <h3 className="event-booking-shows-title">🎭 Επίλεξε παράσταση</h3>
                {onClose && (
                    <button type="button" className="event-booking-close" onClick={onClose} aria-label="Κλείσιμο">
                        ✕
                    </button>
                )}
            </div>

            {shows.length === 0 ? (
                <p className="event-booking-empty">Δεν υπάρχουν διαθέσιμες παραστάσεις αυτή τη στιγμή.</p>
            ) : (
                <div className="event-booking-shows">
                    <div className="event-booking-shows-list">
                        {shows.map((show) => {
                            const showDate = new Date(show.showtime);
                            const now = new Date();
                            const soldOut = (show.max_tickets || 0) <= (show.total_booked || 0);
                            const past = showDate < now;
                            const disabled = soldOut || past || submitting;
                            const dayName = showDate.toLocaleDateString("el-GR", { weekday: "long" });

                            return (
                                <label
                                    key={show.performanceid}
                                    className={`event-booking-show-item ${disabled ? "disabled" : ""}`}
                                >
                                    <input
                                        type="radio"
                                        name="performance"
                                        value={show.performanceid}
                                        checked={selectedShow?.performanceid === show.performanceid}
                                        disabled={disabled}
                                        onChange={handleShowChange}
                                        className="event-booking-radio"
                                    />
                                    {show.event_img && (
                                        <img
                                            width="100"
                                            src={`/media/${show.event_img}`}
                                            alt={show.event_title}
                                            className="event-booking-show-image"
                                        />
                                    )}
                                    <div className="event-booking-show-details">
                                        <span className="event-booking-show-date">
                                            {dayName} — {new Date(show.showtime).toLocaleString("el-GR")}
                                        </span>
                                        <span className="event-booking-show-venue">{show.venue}</span>
                                        <span className="event-booking-show-price">
                                            {Number(show.price || 0).toFixed(2)} €
                                            {Number(show.price_reduced || 0) > 0 && (
                                                <> · μειωμένο {Number(show.price_reduced).toFixed(2)} €</>
                                            )}
                                        </span>
                                        <div className="event-booking-show-status">
                                            {soldOut && "⚠️ Sold Out"}
                                            {!soldOut && past && "⏳ Ολοκληρώθηκε"}
                                            {!soldOut && !past && `Διαθέσιμες: ${Math.max(0, (show.max_tickets || 0) - (show.total_booked || 0))}`}
                                        </div>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}

            {selectedShow && (
                <div className="event-booking-form-wrapper">
                    <form onSubmit={handleSubmit} className="event-booking-form">
                        <h3 className="event-booking-form-title">Στοιχεία κράτησης</h3>

                        <input
                            type="text"
                            name="name"
                            className="event-booking-input"
                            placeholder="Όνομα"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={submitting}
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            className="event-booking-input"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={submitting}
                            required
                        />
                        <input
                            type="tel"
                            name="tel"
                            className="event-booking-input"
                            placeholder="Τηλέφωνο"
                            value={formData.tel}
                            onChange={handleInputChange}
                            disabled={submitting}
                        />

                        <select
                            name="payment_method"
                            className="event-booking-select"
                            value={formData.payment_method}
                            onChange={handleInputChange}
                            disabled={submitting}
                            required
                        >
                            <option value="" disabled>Επίλεξε τρόπο πληρωμής</option>
                            <option value="onsite">Στο θέατρο (30' πριν την έναρξη)</option>
                            <option value="online">Online (PayPal)</option>
                        </select>

                        <input
                            type="number"
                            name="quantity"
                            className="event-booking-input"
                            placeholder="Πλήθος εισιτηρίων"
                            min={1}
                            max={remainingTickets || 1}
                            value={formData.quantity}
                            onChange={handleInputChange}
                            disabled={submitting}
                            required
                        />

                        <p className="event-booking-total">
                            Σύνολο: <strong>{totalPrice} €</strong>
                        </p>

                        {formData.payment_method !== "online" && (
                            <button type="submit" className="event-booking-submit" disabled={submitting}>
                                {submitting ? "Αποθήκευση..." : "Ολοκλήρωση κράτησης"}
                            </button>
                        )}
                    </form>

                    {formData.payment_method === "online" && !currentOrderId && (
                        <button type="button" className="event-booking-submit" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? "Δημιουργία κράτησης..." : "Συνέχεια στην πληρωμή"}
                        </button>
                    )}

                    {currentOrderId && selectedShow && (
                        <Checkout
                            selectedShow={selectedShow}
                            quantity={formData.quantity}
                            price={selectedShow.price}
                            currentReservationId={currentOrderId}
                            onSuccess={handleOnlineSuccess}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default EventBooking;
