// /router.jsx
import { createBrowserRouter,useParams } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import ContentOne from "./components/content/ContentOne";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            { index: true, element: <Home /> },
            { path: "contact", element: <Contact /> },
            { path: "post", element: <Blog /> },
            { path: "login", element: <Login /> },
            { path: "signup", element: <Signup /> },
            { path: "post/:name", element: <ContentOne postName=":name" /> },
        ]
    }
]);

export default router;