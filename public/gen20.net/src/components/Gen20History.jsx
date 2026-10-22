import React, {useEffect, useState} from 'react';
import DB from "../DB";

const Gen20History = () => {
    const path = window.location.pathname.split('/')[1];
    const [block, setBlock] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            const data = await DB.fetchPost(path,'b.sort asc');
            setBlock(data[0] || []);
        };
        fetchData();
    }, []);
    return (
        <section className="services spad">
            <div className="container">
                <div className="row">
                    <div className="">
                        <div className="services__title">
                            <div className="section-title">
                                <span>{path}</span>
                                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                                    Από την Artes Mundi στη Γενιά 20
                                </h2>
                            </div>
                            <p className="text-gray-700 mb-4">
                                Η <strong>Γενιά 20 ΑΜΚΕ</strong> αποτελεί τη φυσική συνέχεια και τον εκσυγχρονισμό
                                της
                                <strong> Artes Mundi ΑΜΚΕ</strong> (2010–2013), με πολιτιστικό έργο που άφησε
                                διακριτό αποτύπωμα στη σύγχρονη καλλιτεχνική παραγωγή:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 mb-4">
                                <li>
                                    <strong>«Μικροί Άλλοι» (2010):</strong> Μεγάλου μήκους ντοκιμαντέρ για τα παιδιά
                                    μεταναστών στην Αθήνα,
                                    προβλήθηκε στο <em>Φεστιβάλ Ντοκιμαντέρ Θεσσαλονίκης 2011</em>.
                                </li>
                                <li>
                                    <strong>«Καθρέφτης» (2012):</strong> Πρωτότυπο διαδραστικό θεατρικό έργο που
                                    παρουσιάστηκε στον χώρο
                                    <em>Tabula Rasa</em> στου Ψυρρή.
                                </li>
                                <li>
                                    <strong>«Η Βασίλισσα του Χιονιού» (2013):</strong> Θεατρική παράσταση για
                                    παιδιά, βασισμένη στον Άντερσεν,
                                    που παρουσιάστηκε σε σχολεία της Αττικής.
                                </li>
                            </ul>
                            <p className="text-gray-700">
                                Η Gen20 ΑΜΚΕ συνεχίζει αυτή τη διαδρομή, υιοθετώντας νέα εργαλεία (AI, video,
                                streaming, υβριδικές σκηνές),
                                ενισχύοντας τη σύνδεση τέχνης, τεχνολογίας και κοινωνικής συνείδησης.
                            </p>
                            <a href="/" className="primary-btn">
                                Περισσότερα
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
export default Gen20History;
