export const ContactBox = () => {
    return (
        <div className="film-sidebar">
            <div className="film-contact">
                <h3>{lang === 'el' ? 'Επικοινωνία' : 'Contact'}</h3>
                <ul>
                    <li><a href={`mailto:${profileData.contacts.email}`}>✉️ Email</a></li>
                    <li><a href={profileData.contacts.website} target="_blank" rel="noreferrer">🌐 Website</a></li>
                    <li><a href={profileData.contacts.facebook} target="_blank" rel="noreferrer">📘 Facebook</a></li>
                    <li><a href={profileData.contacts.instagram} target="_blank" rel="noreferrer">📷 Instagram</a></li>
                    <li><a href={profileData.contacts.twitter} target="_blank" rel="noreferrer">🐦 Twitter</a></li>
                    <li><a href={profileData.contacts.youtube} target="_blank" rel="noreferrer">▶️ YouTube</a></li>
                    <li><a href={profileData.contacts.linkedin} target="_blank" rel="noreferrer">🔗 LinkedIn</a></li>
                </ul>
            </div>
        </div>
    );
}