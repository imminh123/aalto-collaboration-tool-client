import React from 'react';
import { Route, Routes } from "react-router";
import {
  BrowserRouter as Router
} from "react-router-dom";
import './App.css';
import ChatPage from './components/ChatPage/ChatPage';
import Colab from './components/Colab/Colab';
import Login from './components/Login/Login';



const App: React.FC = () => {
  

  return (
    <Router>
      <div>
        <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/docs/:id" element={<Colab />} />
      </Routes>
      </div>
    </Router>

  );
};

export default App;
