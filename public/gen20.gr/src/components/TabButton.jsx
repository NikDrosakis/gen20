//usage: <TabButton label="inject" active={tab === "inject"} onClick={() => setTab("inject")} />
function TabButton({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                ...styles.button,
                background: active ? "#0f0" : "#222",
                color: active ? "#000" : "#0f0"
            }}
        >
            {label}
        </button>
    );
}

const styles = {
    shell: {
        display: "flex",
        height: "100vh",
        background: "#111",
        color: "#0f0",
        fontFamily: "monospace"
    },
    sidebar: {
        width: 120,
        padding: 10,
        borderRight: "1px solid #333",
        display: "flex",
        flexDirection: "column",
        gap: 10
    },
    main: {
        flex: 1,
        padding: 20
    },
    button: {
        padding: "10px 5px",
        border: "1px solid #0f0",
        cursor: "pointer",
        textAlign: "left",
        fontSize: 14
    },
    placeholder: {
        opacity: 0.5
    }
};