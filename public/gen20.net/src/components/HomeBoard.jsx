import React from "react";

const EventBoard = () => {
    return (
        <section className="spad">
            <div className="container">
                <div className="row flex items-center space-x-6 bg-gray-100 p-6 rounded-lg shadow-md">
                    {/* Image section */}
                    <div className="w-1/3">
                        <img
                            src="/img/akroasi1.jpg" // <-- Replace with your actual image path
                            alt="Ακρόαση Ηθοποιών - Πρώτη Γνωριμία"
                            className="w-full h-auto rounded"
                        />
                    </div>

                    {/* Text content section */}
                    <div className="w-2/3">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            📢 <a
                            href="https://www.facebook.com/events/608066588465451/"
                            className="text-blue-600 underline hover:text-blue-800"
                        >
                            Facebook Event
                        </a>
                        </h2>
                        <p className="text-gray-700 text-base leading-relaxed">
                            Για επαγγελματική θεατρική παράσταση σε περιοδεία, θα πραγματοποιηθεί πρώτη γνωριμία & ακρόαση με τον Νικόλα Δροσάκη, την Παρασκευή 27 Ιουνίου 2025 στις 20:00, στον:
                            📍 Λαχανά 12, Ηράκλειο Κρήτης
                            🔸 Αφορά απόφοιτους δραματικής σχολής και έμπειρους ηθοποιούς (άνδρες, γυναίκες)
                            🔸 Δεν απαιτείται προετοιμασμένο υλικό
                            🔸 Ελεύθερη προσέλευση – απλώς δήλωσε "Going" στο fb event
                            📩 Δήλωση συμμετοχής / ερωτήσεις:
                            ✉️ info@gen20.net
                            📱 MP: facebook.com/nikdrosakis {" "}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EventBoard;
