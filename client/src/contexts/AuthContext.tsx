import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { auth } from '../firebase';
import type { User } from 'firebase/auth';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Props for the AuthProvider component
interface AuthProviderProps {
    children: ReactNode;
}

// AuthProvider component to wrap your application
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // Tracks if auth state is still being loaded

    useEffect(() => {
        // Firebase listener for authentication state changes
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
            setLoading(false); // Set loading to false once auth state is determined
        });

        return unsubscribe; // Clean up the subscription when the component unmounts
    }, []); // Empty dependency array means this effect runs only once on mount

    const value = {
        currentUser,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children} {/* Only render children once authentication state is known */}
        </AuthContext.Provider>
    );
};