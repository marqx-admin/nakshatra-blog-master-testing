import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AdminApiProvider } from "./app/query-client/AdminApiProvider";
import { AdminRouter } from "./app/router/AdminRouter";
import "./styles/admin.css";

const root=document.getElementById("root");
if(!root) throw new Error("Central Admin root element is missing");
createRoot(root).render(<StrictMode><AdminApiProvider><AdminRouter/></AdminApiProvider></StrictMode>);
