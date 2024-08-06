// App.js
import React, { createContext, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Ishikawa from './components/Ishikawa/Ishikawa';
import Login from './components/Login/login'

export const UserContext = createContext(null);

function App() {
  const [userData, setUserData] = useState(null);

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      <div className="App">
        <Router>
          <Routes>
          <Route path="/" element={<Login />} />
            <Route path="/ishikawavacio" element={<Ishikawa />} />
          </Routes>
        </Router>
      </div>
    </UserContext.Provider>
  );
}

export default App;
