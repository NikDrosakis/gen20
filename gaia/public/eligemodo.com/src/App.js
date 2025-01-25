import React from "react";
import { Routes, Route, useParams } from "react-router-dom";
import './App.css';
import Home from './pages/Home';
import Privacy from './pages/Privacy';

const App = () => {
  return (
        <Routes>
          <Route exact path="/" element={<Home/>}/>
          <Route path="/privacy" element={<Privacy/>}/>
        </Routes>
  );
}

export default App;
