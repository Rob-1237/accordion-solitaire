import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect, createContext } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { MultiBackend } from 'react-dnd-multi-backend';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AnimatePresence, motion } from 'framer-motion';

import { AuthProvider } from './contexts/AuthContext';
import Auth from './components/Auth';
import Game from './components/Game';
import OnloadOverlay from './components/OnloadOverlay';

// Overlay context to allow children to trigger the overlay
export const OverlayContext = createContext<{ setShowOverlay: (show: boolean) => void }>({ setShowOverlay: () => { } });

// Multi-backend configuration for desktop and mobile
const backendOptions = {
    backends: [
        {
            id: 'html5',
            backend: HTML5Backend,
            transition: {
                dragSourceNotGrabbed: true,
            },
            preview: true,
        },
        {
            id: 'touch',
            backend: TouchBackend,
            options: {
                enableMouseEvents: true,
                delay: 200,
                delayTouchStart: 200,
            },
            preview: true,
            transition: {
                touchstart: (monitor: any) => !monitor.isDragging(),
            },
        },
    ],
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
                <DndProvider backend={MultiBackend} options={backendOptions}>
                    <Router>
                        {showOverlay ? <OnloadOverlay /> : <AppRoutesWithAnimation />}
                    </Router>
                </DndProvider>
            </AuthProvider>
        </OverlayContext.Provider>
    );
}

export default App;