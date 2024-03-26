import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import { store } from "./redux/index";
import { persistStore } from "redux-persist";
import { WebSocketProvider } from "./hooks";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

export const persistor = persistStore(store);

root.render(
  <React.StrictMode>
    <Provider store={store}>
        <WebSocketProvider>
          <App/>
        </WebSocketProvider>
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
