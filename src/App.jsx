import React from "react";
import AppWithNotifications from "./components/AppWithNotifications";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <AppWithNotifications />
      <ToastContainer position="top-right" autoClose={5000} />
    </>
  );
}

export default App;