import React, { useState } from 'react';
import { Route, Routes } from "react-router";
import {
  BrowserRouter as Router, Link
} from "react-router-dom";
import './App.css';
import Login from './components/Login/Login';
import ChatPage from './components/ChatPage/ChatPage';




const App: React.FC = () => {
  

  return (
    <Router>
      <div>
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
      </div>
    </Router>

  );
};

export default App;
