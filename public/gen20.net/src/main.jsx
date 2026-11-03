// /main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { HelmetProvider } from 'react-helmet-async';
import { GProvider } from './contexts/GContext';
ReactDOM.createRoot(document.getElementById("root")).render(
    <GProvider>
    <HelmetProvider>
            <RouterProvider router={router} />
    </HelmetProvider>
    </GProvider>
);