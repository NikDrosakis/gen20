import "./Carousel.css";

export default function Carousel({ items }) {
    function ucfirst(str) {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    return (
        <div className="carousel-container">
            <div className="carousel-track">
                {items.map((ev, i) => (
                    <div key={i} className="carousel-item">
                        <h3 className="carousel-title">{ucfirst(ev.name)}</h3>
                        <p className="carousel-subtitle">{ev.subtitle}</p>
                        <a href={`/${ev.name || '#'}`}>
                            <img
                                src={ev.img}
                                alt={ev.name}
                                className="carousel-img"
                            />
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}
