import Chatbox from "./Chatbox";

const { openChat, activeChat } = useChat();
const [cid, setCid] = useState(0);

// στο ChatList
<ChatList
    activeChat={activeChat}
    onOpenChat={(s) => {
        openChat(s);
        // εξήγαγε cid από το s.id: "conversation:1" → 1
        const cid = parseInt(s.id.split(":")[1], 10);
        setCid(cid);
    }}
/>

{activeChat && <ChatBox to={activeChat.userId} cid={cid} />}