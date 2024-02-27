import React, { useState } from 'react';
import { Route, Routes } from "react-router";
import {
  BrowserRouter as Router, Link
} from "react-router-dom";
import './App.css';
import Login from './components/Login/Login';
import ChatPage from './components/ChatPage/ChatPage';
import Colab from './components/Colab/Colab';



const App: React.FC = () => {
  

  return (
    <Router>
      <div>
        <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/colab/:id" element={<Colab />} />
      </Routes>
      </div>
    </Router>

  );
};

export default App;
