import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initAuthToken } from "@/lib/auth-token";

initAuthToken();

createRoot(document.getElementById("root")!).render(<App />);
