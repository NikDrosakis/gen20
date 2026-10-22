export default function Carousel({ items }) {
    function ucfirst(str) {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    return (
        <div style={styles.container}>
            <div style={styles.track}>
                {items.map((ev, i) => (
                    <div key={i} style={styles.item}>
                        <h3 style={styles.title}>{ucfirst(ev.name)}</h3>
                        <p style={styles.subtitle}>{ev.subtitle}</p>
                        <a href={`/${ev.name || '#'}`}>
                            <img
                                src={ev.img}
                                alt={ev.name}
                                style={styles.img}
                            />
                        </a>
                    </div>
                ))}
            </div>

            {/* inline keyframes because you're using inline styles */}
            <style>
                {`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                `}
            </style>
        </div>
    );
}

const styles = {
    container: {
        width: "100%",
        overflow: "hidden",
    },
    track: {
        display: "flex",
        gap: "10px",
        width: "max-content",
        flexDirection: "column"
    },
    item: {
        minWidth: "240px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    title: {
        color: "var(--text)",
        marginBottom: "4px",
        textAlign: "center",
    },
    subtitle: {
        fontSize: "1em",
        fontStretch:"condensed",
        color: "var(--text)",
        marginBottom: "8px",
        textAlign: "center",
    },
    img: {
        width: "240px",
        height: "150px",
        borderRadius: "12px",
        objectFit: "cover",
        objectPosition: "top",
    }
};
