import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect, createContext } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AnimatePresence, motion } from 'framer-motion';

import { AuthProvider } from './contexts/AuthContext';
import Auth from './components/Auth';
import Game from './components/Game';
import OnloadOverlay from './components/OnloadOverlay';

// Overlay context to allow children to trigger the overlay
export const OverlayContext = createContext<{ setShowOverlay: (show: boolean) => void }>({ setShowOverlay: () => { } });

// Detect if device supports touch
const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Choose backend based on device capabilities
const getBackend = () => {
    if (isTouchDevice()) {
        return TouchBackend;
    }
    return HTML5Backend;
};

// Touch backend options
const touchBackendOptions = {
    enableMouseEvents: true,
    delay: 150,
    delayTouchStart: 150,
    touchSlop: 16,
};

function AppRoutesWithAnimation() {
    const location = useLocation();
    return (
        <>
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
                <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>
                        <Route path="/login" element={
                            <motion.div
                                initial={{ opacity: 0, x: 80 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -80 }}
                                transition={{ duration: 0.4, ease: 'easeInOut' }}
                                className="min-h-screen"
                            >
                                <Auth />
                            </motion.div>
                        } />
                        <Route path="/" element={
                            <motion.div
                                initial={{ opacity: 0, x: 80 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -80 }}
                                transition={{ duration: 0.4, ease: 'easeInOut' }}
                                className="min-h-screen"
                            >
                                <Game />
                            </motion.div>
                        } />
                    </Routes>
                </AnimatePresence>
            </div>
        </>
    );
}

function App() {
    const [showOverlay, setShowOverlay] = useState(true);

    useEffect(() => {
        if (showOverlay) {
            const timer = setTimeout(() => setShowOverlay(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [showOverlay]);

    return (
        <OverlayContext.Provider value={{ setShowOverlay }}>
            <AuthProvider>
                <DndProvider 
                    backend={getBackend()} 
                    options={isTouchDevice() ? touchBackendOptions : undefined}
                >
                    <Router>
                        {showOverlay ? <OnloadOverlay /> : <AppRoutesWithAnimation />}
                    </Router>
                </DndProvider>
            </AuthProvider>
        </OverlayContext.Provider>
    );
}

export default App;