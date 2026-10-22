// /router.jsx
import { createBrowserRouter,useParams } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import ContentOne from "./components/content/ContentOne";
import Contact from "./pages/Contact";
import CV from "./pages/CV";
import Publications from "./pages/Publications";
import Research from "./pages/Research";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

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