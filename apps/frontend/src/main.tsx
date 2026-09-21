import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "sonner";

import { store, persistor } from "./store";
import { ErrorBoundary } from "./components/ErrorBoundary";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate
          loading={
            <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
              Loading…
            </div>
          }
          persistor={persistor}
        >
          <BrowserRouter>
            <Toaster richColors position="top-right" />
            <App />
          </BrowserRouter>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
);
