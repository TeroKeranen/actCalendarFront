import React from "react";
import ReactDOM from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";
import App from "./App";

import 'react-toastify/dist/ReactToastify.css'
import './index.css'
// import { ToastContainer } from "react-toastify";
import { store } from "./store"
import {Provider} from 'react-redux';
import { ToastContainer } from "react-toastify";

ReactDOM.createRoot(document.getElementById("root")).render(

  <Provider store={store}>
    <App />
   <ToastContainer position='top-center' />
  </Provider >
);
