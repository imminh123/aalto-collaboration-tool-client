import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import { store } from "./redux/index";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { WebSocketProvider } from "./hooks";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

export const persistor = persistStore(store);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <WebSocketProvider>
          <App/>
        </WebSocketProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
