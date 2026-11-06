// /router.jsx
import { createBrowserRouter,  useParams } from "react-router-dom";
import App from "./App";
import Home from "./Home";
import Radio from "./Radio";
import Whois from "./Whois";
import Board from "./Board";
import Contact from "./Contact";
import MemberForm from "./MemberForm";
import ContentOne from "./ContentOne";
import Blog from "./Blog";
import Faq from "./Faq";
import Arxeio from "./Arxeio";
import Reels from "./Reels";
import Login from "./Login";
import Signup from "./Signup";
const BlogWrapper = () => {
    const { path } = useParams();
    const titles = {
        publications: 'Θέσεις/Παρεμβάσεις',
        actions: 'Εκδηλώσεις/Δράσεις'
    };
    return <Blog classification={path} pageTitle={titles[path] || path} />;
};
export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            { index: true, element: <Home /> },
            { path: "whois", element: <Whois /> },
            { path: ":classification", element: <BlogWrapper />},
            { path: "login", element: <Login /> },
            { path: "signup", element: <Signup /> },
            { path: "radio", element: <Radio /> },
            { path: "reels", element: <Reels /> },
            { path: "faq", element: <Faq /> },
            { path: "arxeio", element: <Arxeio /> },
            { path: "join", element: <MemberForm /> },
            { path: "contact", element: <Contact /> },
            { path: "board", element: <Board /> },
            { path: "post/:name", element: <ContentOne postName=":name"/> }
        ]
    }
]);