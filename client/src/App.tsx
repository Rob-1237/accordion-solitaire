import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; // Correct path to AuthContext
import Auth from './components/Auth'; // Correct component name (was LoginPage)
import Game from './components/Game';
// import PrivateRoute from './components/PrivateRoute';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EtherealBackground from './components/EtherealBackground';

function App() {
  return (
    <AuthProvider>
      <DndProvider backend={HTML5Backend}>
        <Router>
          <EtherealBackground />
          <div className="relative z-10">
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
            />
            <Routes>
              <Route path="/login" element={<Auth />} /> {/* Use Auth component for login page */}
              <Route path="/" element={<Game />} />
              {/* <Route path="/" element={<PrivateRoute><Game /></PrivateRoute>} /> */}
            </Routes>
          </div>
        </Router>
      </DndProvider>
    </AuthProvider>
  );
}

export default App;