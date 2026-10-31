
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Arxeio from "./pages/Arxeio.jsx";
import Blog from "./pages/Blog.jsx";
import Board from "./pages/Board.jsx";
import Contact from "./pages/Contact.jsx";
import Faq from "./pages/Faq.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Radio from "./pages/Radio.jsx";
import Reels from "./pages/Reels.jsx";
import Signup from "./pages/Signup.jsx";
import Whois from "./pages/Whois.jsx";
import ErrorBoundary from "./components/ErrorBoundary";

const ErrorElement = () => <ErrorBoundary><div /></ErrorBoundary>;

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        errorElement: <ErrorElement />,
        children: [
            { index: true, element: <Home /> },
            { path: "arxeio", element: <Arxeio /> },
            { path: "blog", element: <Blog /> },
            { path: "board", element: <Board /> },
            { path: "contact", element: <Contact /> },
            { path: "faq", element: <Faq /> },
            { path: "login", element: <Login /> },
            { path: "radio", element: <Radio /> },
            { path: "reels", element: <Reels /> },
            { path: "signup", element: <Signup /> },
            { path: "whois", element: <Whois /> }
        ]
    }
]);

export default router;
