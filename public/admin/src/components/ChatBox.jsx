function ChatBox({ to }) {
    const { sendChat, messages } = useMessaging();
    const [text, setText] = useState("");

    const sendMsg = () => {
        if (!text.trim()) return;
        sendChat(to, text);
        setText("");
    };

    return (
        <div>
            {messages
                .filter((m) => m.system === "chat")
                .map((m, i) => (
                    <div key={i}><b>{m.userid}:</b> {m.verba}</div>
                ))}
            <input value={text} onChange={(e) => setText(e.target.value)} />
            <button onClick={sendMsg}>Send</button>
        </div>
    );
}
function NotifyButton() {
    const { sendSystem } = useMessaging();
    return <button onClick={() => sendSystem("New domain added")}>Notify</button>;
}