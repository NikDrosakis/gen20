// /router.jsx
import { createBrowserRouter,useParams } from "react-router-dom";
import App from "./App";
import Home from "./Home";
import Blog from "./Blog";
import ContentOne from "./ContentOne";
import Contact from "./Contact";
import Login from "./Login";
import Signup from "./Signup";

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