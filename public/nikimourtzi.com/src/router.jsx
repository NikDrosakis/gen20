// /router.jsx
import { createBrowserRouter,useParams } from "react-router-dom";
import App from "./App";
import Home from "./Home";
import Blog from "./Blog";
import ContentOne from "./ContentOne";
import Contact from "./Contact";
import CV from "./CV";
import Publications from "./Publications";
import Research from "./Research";
import Login from "./Login";
import Signup from "./Signup";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            { index: true, element: <Home /> },
            { path: "contact", element: <Contact /> },
            { path: "post", element: <Blog /> },
            { path: "publications", element: <Publications /> },
            { path: "research", element: <Research /> },
            { path: "login", element: <Login /> },
            { path: "CV", element: <CV /> },
            { path: "signup", element: <Signup /> },
            { path: "post/:name", element: <ContentOne postName=":name"/> },
        ]
    }
]);