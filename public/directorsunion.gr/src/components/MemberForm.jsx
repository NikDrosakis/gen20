// pages/MemberForm.jsx
import React, { useState, useEffect } from 'react';
import './MemberForm.css';

const STORAGE_KEY = 'union_member_application';

const MemberForm = () => {
    const [formData, setFormData] = useState({
        // Identity
        firstname: '',
        lastname: '',
        fathername: '',
        mothername: '',
        id_card_number: '',
        email: '',
        // Residence
        city: '',
        address: '',
        area: '',
        postal_code: '',
        phone: '',
        // Education
        education_general: '',
        education_artistic: '',
        education_other: '',
        languages: '',
        // Optional
        military_service: false,
        has_child_under_3: false,
        // Works (max 3)
        works: [
            { title: '', type: '', year: '', role: '', presentations: '', link: '', awards: '' },
            { title: '', type: '', year: '', role: '', presentations: '', link: '', awards: '' },
            { title: '', type: '', year: '', role: '', presentations: '', link: '', awards: '' }
        ],
        additional_works: '',
        other_artistic_works: '',
        // Agreement
        signature_name: '',
        contribution_amount: 15.00,
        contribution_paid: false
    });

    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ show: false, message: '', type: '' });
    const [currentStep, setCurrentStep] = useState(1);
    const [initialized, setInitialized] = useState(false);

    // Load saved data from localStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                setFormData(prev => ({
                    ...prev,
                    ...parsedData,
                    // Ensure works array is preserved properly
                    works: parsedData.works || prev.works
                }));
                // Restore saved step if exists
                if (parsedData._savedStep) {
                    setCurrentStep(parsedData._savedStep);
                }
                showNotification('Τα προηγούμενα δεδομένα αποκαταστάθηκαν', 'info');
            } catch (e) {
                console.error('Error loading saved data:', e);
            }
        }
        setInitialized(true);
    }, []);

    // Auto-save to localStorage whenever formData changes
    useEffect(() => {
        if (initialized) {
            const dataToSave = {
                ...formData,
                _savedStep: currentStep,
                _lastSaved: new Date().toISOString()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        }
    }, [formData, currentStep, initialized]);

    const showNotification = (message, type = 'success') => {
        setSubmitStatus({ show: true, message, type });
        setTimeout(() => setSubmitStatus({ show: false, message: '', type: '' }), 5000);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleWorkChange = (index, field, value) => {
        const updatedWorks = [...formData.works];
        updatedWorks[index][field] = value;
        setFormData(prev => ({ ...prev, works: updatedWorks }));
    };

    const validateStep = () => {
        if (currentStep === 1) {
            if (!formData.firstname || !formData.lastname || !formData.email) {
                showNotification('Παρακαλώ συμπληρώστε Όνομα, Επώνυμο και Email', 'error');
                return false;
            }
            if (!formData.email.includes('@')) {
                showNotification('Παρακαλώ εισάγετε έγκυρο email', 'error');
                return false;
            }
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep()) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    const clearSavedData = () => {
        localStorage.removeItem(STORAGE_KEY);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.signature_name) {
            showNotification('Παρακαλώ συμπληρώστε το ονοματεπώνυμό σας ως υπογραφή', 'error');
            return;
        }

        setSubmitting(true);

        const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

        try {
            const response = await fetch('/api/v1/maria/insert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    table: `${publicdb}.c_unionmember`,
                    params: {
                        firstname: formData.firstname,
                        lastname: formData.lastname,
                        fathername: formData.fathername || null,
                        mothername: formData.mothername || null,
                        id_card_number: formData.id_card_number || null,
                        email: formData.email,
                        city: formData.city || null,
                        address: formData.address || null,
                        area: formData.area || null,
                        postal_code: formData.postal_code || null,
                        phone: formData.phone || null,
                        education_general: formData.education_general || null,
                        education_artistic: formData.education_artistic || null,
                        education_other: formData.education_other || null,
                        languages: formData.languages || null,
                        military_service: formData.military_service ? 1 : 0,
                        has_child_under_3: formData.has_child_under_3 ? 1 : 0,
                        works: JSON.stringify(formData.works.filter(w => w.title)),
                        additional_works: formData.additional_works || null,
                        other_artistic_works: formData.other_artistic_works || null,
                        signature_name: formData.signature_name,
                        contribution_amount: formData.contribution_amount,
                        contribution_paid: formData.contribution_paid ? 1 : 0,
                        status: 0
                    }
                })
            });

            const result = await response.json();

            if (result.success) {
                clearSavedData(); // Clear saved data after successful submission
                showNotification('Η αίτησή σας υποβλήθηκε επιτυχώς! Θα ενημερωθείτε άμεσα.', 'success');
                setTimeout(() => {
                    window.location.href = '/';
                }, 3000);
            } else {
                throw new Error(result.error || 'Submission failed');
            }
        } catch (error) {
            console.error('Submission error:', error);
            showNotification('Σφάλμα κατά την υποβολή: ' + error.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // Clear form (optional - add a reset button)
    const handleReset = () => {
        if (window.confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε όλα τα δεδομένα της φόρμας;')) {
            localStorage.removeItem(STORAGE_KEY);
            window.location.reload();
        }
    };

    if (!initialized) {
        return <div className="member-form-loading">Loading...</div>;
    }

    return (
        <div className="member-form-container">
            <div className="member-form-header">
                <h1>ΑΙΤΗΣΗ ΕΓΓΡΑΦΗΣ</h1>
                <h2>ΕΝΩΣΗ ΣΚΗΝΟΘΕΤΩΝ ΔΗΜΙΟΥΡΓΩΝ</h2>
                <p>
                    ΑΙΤΗΣΗ ΕΓΓΡΑΦΗΣ Το προσωρινό Διοικητικό Συμβούλιο της Ένωσης Σκηνοθετών Δημιουργών Οπτικοακουστικών και Παραστατικών Τεχνών έχει δρομολογήσει την ολοκλήρωση της διαδικασίας για την εγγραφή μας στα βιβλία σωματείων του Πρωτοδικείου Αθηνών. Για την κάλυψη των νομικών εξόδων, καλούμε τα μέλη που έχουν ήδη εγγραφεί, αλλά και όσους συναδέλφους επιθυμούν να εγγραφούν στον νέο φορέα, μαζί με την αίτηση εγγραφής, να καταβάλουν και την ενίσχυση των 15€ στον λογαριασμό που αναγράφετε στην αίτηση, ώστε να συγκεντρωθεί άμεσα το ποσό και να ολοκληρωθεί η διαδικασία.
                </p>

                {/* Auto-save indicator */}
                <div className="auto-save-indicator">
                    💾 Αυτόματη αποθήκευση ενεργή
                </div>

                <div className="step-indicator">
                    <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1. Στοιχεία Ταυτότητας</div>
                    <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2. Στοιχεία Διαμονής</div>
                    <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>3. Σπουδές & Γλώσσες</div>
                    <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>4. Εργογραφία</div>
                    <div className={`step ${currentStep >= 5 ? 'active' : ''}`}>5. Υποβολή</div>
                </div>

                <button type="button" className="btn-reset" onClick={handleReset} style={{ marginTop: '10px', fontSize: '12px', padding: '4px 12px' }}>
                    Επαναφορά φόρμας
                </button>
            </div>

            {submitStatus.show && (
                <div className={`member-notification member-notification-${submitStatus.type}`}>
                    {submitStatus.type === 'success' ? '✓ ' : '✗ '}{submitStatus.message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="member-form">
                {/* Step 1: Identity */}
                {currentStep === 1 && (
                    <div className="form-section">
                        <h3>ΣΤΟΙΧΕΙΑ ΤΑΥΤΟΤΗΤΑΣ ΑΙΤΟΥΝΤΟΣ</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>ΟΝΟΜΑ *</label>
                                <input type="text" name="firstname" value={formData.firstname} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>ΕΠΩΝΥΜΟ *</label>
                                <input type="text" name="lastname" value={formData.lastname} onChange={handleInputChange} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>ΟΝΟΜΑ ΠΑΤΡΟΣ</label>
                                <input type="text" name="fathername" value={formData.fathername} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>ΟΝΟΜΑ ΜΗΤΡΟΣ</label>
                                <input type="text" name="mothername" value={formData.mothername} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>ΑΡ. ΔΕΛΤΙΟΥ ΤΑΥΤΟΤΗΤΟΣ</label>
                                <input type="text" name="id_card_number" value={formData.id_card_number} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>E MAIL *</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Residence */}
                {currentStep === 2 && (
                    <div className="form-section">
                        <h3>ΣΤΟΙΧΕΙΑ ΔΙΑΜΟΝΗΣ</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>ΠΟΛΗ</label>
                                <input type="text" name="city" value={formData.city} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>ΟΔΟΣ ΚΑΙ ΑΡΙΘΜΟΣ</label>
                                <input type="text" name="address" value={formData.address} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>ΠΕΡΙΟΧΗ</label>
                                <input type="text" name="area" value={formData.area} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Τ.Κ</label>
                                <input type="text" name="postal_code" value={formData.postal_code} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>ΤΗΛΕΦΩΝΑ</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Education & Languages */}
                {currentStep === 3 && (
                    <div className="form-section">
                        <h3>ΣΤΟΙΧΕΙΑ ΣΠΟΥΔΩΝ</h3>
                        <div className="form-group">
                            <label>ΓΕΝΙΚΕΣ (ΜΕΣΗ, ΑΝΩΤΕΡΑ, ΑΝΩΤΑΤΗ)</label>
                            <textarea name="education_general" rows="3" value={formData.education_general} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>ΚΑΛΛΙΤΕΧΝΙΚΕΣ (ΚΙΝΗΜΑΤΟΓΡΑΦΟΣ, ΤΗΛΕΟΡΑΣΗ, ΘΕΑΤΡΟ)</label>
                            <textarea name="education_artistic" rows="3" value={formData.education_artistic} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>ΑΛΛΕΣ</label>
                            <textarea name="education_other" rows="2" value={formData.education_other} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>ΞΕΝΕΣ ΓΛΩΣΣΕΣ</label>
                            <textarea name="languages" rows="2" value={formData.languages} onChange={handleInputChange} placeholder="Γλώσσα & Επίπεδο" />
                        </div>
                        <div className="form-row">
                            <div className="form-group checkbox">
                                <label>
                                    <input type="checkbox" name="military_service" checked={formData.military_service} onChange={handleInputChange} />
                                    Υποψήφιο μέλος που εκτελεί στρατιωτική θητεία
                                </label>
                            </div>
                            <div className="form-group checkbox">
                                <label>
                                    <input type="checkbox" name="has_child_under_3" checked={formData.has_child_under_3} onChange={handleInputChange} />
                                    Υποψήφιο μέλος μητέρα παιδιού έως τριών ετών
                                </label>
                            </div>
                        </div>
                        <div className="info-note">
                            * Σύμφωνα με το καταστατικό, μέλη που ασκούν στρατιωτική θητεία και μητέρες παιδιών έως τριών ετών, δεν υποχρεούνται να καταβάλουν ετήσια συνδρομή.
                        </div>
                    </div>
                )}

                {/* Step 4: Works */}
                {currentStep === 4 && (
                    <div className="form-section">
                        <h3>ΕΡΓΟΓΡΑΦΙΑ ΑΙΤΟΥΝΤΟΣ</h3>
                        {[0, 1, 2].map((idx) => (
                            <div key={idx} className="work-entry">
                                <h4>ΕΡΓΟ {idx + 1}</h4>
                                <div className="form-row">
                                    <div className="form-group full-width">
                                        <label>ΤΙΤΛΟΣ ΕΡΓΟΥ</label>
                                        <input type="text" value={formData.works[idx].title} onChange={(e) => handleWorkChange(idx, 'title', e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>ΕΙΔΟΣ</label>
                                        <input type="text" value={formData.works[idx].type} onChange={(e) => handleWorkChange(idx, 'type', e.target.value)} placeholder="Ταινία μικρού μήκους, Ντοκιμαντέρ, Θεατρική παράσταση..." />
                                    </div>
                                    <div className="form-group">
                                        <label>ΕΤΟΣ ΠΑΡΑΓΩΓΗΣ</label>
                                        <input type="text" value={formData.works[idx].year} onChange={(e) => handleWorkChange(idx, 'year', e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>ΙΔΙΟΤΗΤΑ ΑΙΤΟΥΝΤΟΣ</label>
                                        <input type="text" value={formData.works[idx].role} onChange={(e) => handleWorkChange(idx, 'role', e.target.value)} placeholder="Σκηνοθέτης, Παραγωγός, Σεναριογράφος..." />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>ΠΑΡΟΥΣΙΑΣΕΙΣ / ΠΡΟΒΟΛΕΣ</label>
                                    <textarea rows="2" value={formData.works[idx].presentations} onChange={(e) => handleWorkChange(idx, 'presentations', e.target.value)} placeholder="Φεστιβάλ, Κινηματογράφοι, Θέατρα..." />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>ΣΧΕΤΙΚΟΣ ΣΥΝΔΕΣΜΟΣ</label>
                                        <input type="url" value={formData.works[idx].link} onChange={(e) => handleWorkChange(idx, 'link', e.target.value)} placeholder="https://..." />
                                    </div>
                                    <div className="form-group">
                                        <label>ΔΙΑΚΡΙΣΕΙΣ</label>
                                        <input type="text" value={formData.works[idx].awards} onChange={(e) => handleWorkChange(idx, 'awards', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="form-group">
                            <label>ΕΠΙΠΛΕΟΝ ΕΡΓΑ (Έως δέκα αναφορές, διευκρίνηση ιδιότητας ανά έργο)</label>
                            <textarea name="additional_works" rows="6" value={formData.additional_works} onChange={handleInputChange} placeholder="1. ...&#10;2. ...&#10;3. ..." />
                        </div>

                        <div className="form-group">
                            <label>ΑΛΛΕΣ ΚΑΛΛΙΤΕΧΝΙΚΕΣ / ΠΝΕΥΜΑΤΙΚΕΣ ΕΡΓΑΣΙΕΣ</label>
                            <textarea name="other_artistic_works" rows="6" value={formData.other_artistic_works} onChange={handleInputChange} placeholder="Συγγραφικό έργο, φωτογραφικό έργο, εικαστικό έργο, video art, δημοσιευμένες μελέτες, διδασκαλία, διαχείριση καλλιτεχνικών σχολών, δημιουργία ιστότοπων, συμμετοχή σε θεατρικές ομάδες..." />
                        </div>
                    </div>
                )}

                {/* Step 5: Submission */}
                {currentStep === 5 && (
                    <div className="form-section">
                        <h3>ΥΠΟΒΟΛΗ ΑΙΤΗΣΗΣ</h3>

                        <div className="agreement-text">
                            <p>
                                Ο/Η κάτωθι υπογράφων/ουσα <strong>{formData.firstname} {formData.lastname}</strong> ζητώ να εγγραφώ στην
                                ΕΝΩΣΗ ΔΗΜΙΟΥΡΓΩΝ ΣΚΗΝΟΘΕΤΩΝ. Γνωρίζω ότι υποχρεούμαι να καταβάλω τακτική συνδρομή ή άλλη νόμιμη εισφορά
                                και δηλώνω ότι αποδέχομαι ανεπιφύλακτα τις διατάξεις του Καταστατικού και τις αποφάσεις της Γενικής Συνέλευσης.
                            </p>
                        </div>

                        <div className="form-group">
                            <label>ΟΝΟΜΑΤΕΠΩΝΥΜΟ ΥΠΟΓΡΑΦΗΣ *</label>
                            <input type="text" name="signature_name" value={formData.signature_name} onChange={handleInputChange} required />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>ΠΟΣΟ ΕΝΙΣΧΥΣΗΣ (€)</label>
                                <input type="number" name="contribution_amount" value={formData.contribution_amount} onChange={handleInputChange} step="0.01" />
                                <small>Προτεινόμενο ποσό: 15.00€</small>
                            </div>
                            <div className="form-group checkbox">
                                <label>
                                    <input type="checkbox" name="contribution_paid" checked={formData.contribution_paid} onChange={handleInputChange} />
                                    Κατέθεσα την ενίσχυση μέσω τράπεζας
                                </label>
                            </div>
                        </div>

                        <div className="bank-info">
                            <h4>Τραπεζικά Στοιχεία</h4>
                            <p><strong>ΕΘΝΙΚΗ ΤΡΑΠΕΖΑ</strong></p>
                            <p>ΙΒΑΝ: GR8801101220000012263448958</p>
                            <p className="note">Παρακαλούμε να γράψετε το ονοματεπώνυμό σας στην αιτιολογία κατάθεσης</p>
                        </div>
                    </div>
                )}

                <div className="form-navigation">
                    {currentStep > 1 && (
                        <button type="button" className="btn-prev" onClick={prevStep}>
                            ‹ Πίσω
                        </button>
                    )}
                    {currentStep < 5 ? (
                        <button type="button" className="btn-next" onClick={nextStep}>
                            Επόμενο ›
                        </button>
                    ) : (
                        <button type="submit" className="btn-submit" disabled={submitting}>
                            {submitting ? 'Υποβολή...' : 'Υποβολή Αίτησης'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default MemberForm;