import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; // Correct path to AuthContext
import Auth from './components/Auth'; // Correct component name (was LoginPage)
import Game from './components/Game';
import PrivateRoute from './components/PrivateRoute'; // Correct path to PrivateRoute
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

function App() {
  return (
    <AuthProvider>
      <DndProvider backend={HTML5Backend}>
        <Router>
          <Routes>
            <Route path="/login" element={<Auth />} /> {/* Use Auth component for login page */}
            <Route path="/" element={<PrivateRoute><Game /></PrivateRoute>} />
          </Routes>
        </Router>
      </DndProvider>
    </AuthProvider>
  );
}

export default App;