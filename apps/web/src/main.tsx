import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import "./styles/index.css";

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 15_000 } } });
createRoot(document.getElementById("root")!).render(<BrowserRouter><QueryClientProvider client={queryClient}><App /></QueryClientProvider></BrowserRouter>);
