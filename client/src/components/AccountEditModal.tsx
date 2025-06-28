import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';

import type { User } from 'firebase/auth';
import {
    updateProfile,
    updateEmail,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
} from 'firebase/auth';
import { saveUserProfile } from '../services/firebaseService';

interface AccountEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User | null;
    onProfileUpdated?: () => void;
}

const AccountEditModal: React.FC<AccountEditModalProps> = ({ isOpen, onClose, currentUser, onProfileUpdated }) => {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(isOpen);

    useEffect(() => {
        if (currentUser) {
            setDisplayName(currentUser.displayName || '');
            setEmail(currentUser.email || '');
        }
        setPassword('');
        setCurrentPassword('');
    }, [currentUser, isOpen]);

    useEffect(() => {
        if (isOpen) setIsVisible(true);
    }, [isOpen]);

    if (!isOpen && !isVisible) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        setLoading(true);
        let errorMsg = '';
        try {
            // If email or password is changing, re-authenticate
            if ((email && email !== currentUser.email) || password) {
                if (!currentPassword) {
                    throw new Error('Current password is required to change email or password.');
                }
                const credential = EmailAuthProvider.credential(currentUser.email || '', currentPassword);
                await reauthenticateWithCredential(currentUser, credential);
            }
            // Update displayName if changed
            if (displayName && displayName !== currentUser.displayName) {
                await updateProfile(currentUser, { displayName });
            }
            // Update email if changed
            if (email && email !== currentUser.email) {
                await updateEmail(currentUser, email);
            }
            // Update password if provided
            if (password) {
                await updatePassword(currentUser, password);
            }
            // Update Firestore profile
            await saveUserProfile(currentUser.uid, { displayName, email });
            // Refresh user content
            await currentUser.reload();
            if (onProfileUpdated) onProfileUpdated();
            toast.success('Profile updated successfully!');
            setIsVisible(false); // Trigger exit animation
        } catch (err: any) {
            errorMsg = err.message || 'An error occurred while updating your profile.';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const modalContent = (
        <AnimatePresence
            onExitComplete={() => {
                if (!isVisible) {
                    onClose();
                }
            }}
        >
            {isOpen && isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 40 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    style={{ width: '100vw', height: '100vh', background: 'rgb(0, 0, 0, .9)' }}
                    className="fixed inset-0 z-50 flex items-center justify-center"
                >
                    <div className="shadow-2xl rounded-2xl p-6 w-half max-w-md backdrop-blur-lg">
                        <h2 className="text-2xl font-bold mb-4 text-center">Edit Account</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="displayName">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    id="displayName"
                                    className="bg-white/30 border border-white/40 rounded-lg px-3 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-300 backdrop-blur-sm transition w-full"
                                    value={displayName}
                                    onChange={e => setDisplayName(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className="bg-white/30 border border-white/40 rounded-lg px-3 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-300 backdrop-blur-sm transition w-full"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    className="bg-white/30 border border-white/40 rounded-lg px-3 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-300 backdrop-blur-sm transition w-full"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Leave blank to keep current password"
                                    disabled={loading}
                                />
                            </div>
                            {(email !== (currentUser?.email || '') || password) && (
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="currentPassword">
                                        Current Password (required to change email or password)
                                    </label>
                                    <input
                                        type="password"
                                        id="currentPassword"
                                        className="bg-white/30 border border-white/40 rounded-lg px-3 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-300 backdrop-blur-sm transition w-full"
                                        value={currentPassword}
                                        onChange={e => setCurrentPassword(e.target.value)}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            )}
                            <button
                                type="button"
                                className="glass-shimmer relative bg-white/20 border border-white/30 text-white font-bold rounded-lg px-4 py-2 backdrop-blur-md shadow-lg transition-all duration-200 w-full mb-2"
                                onClick={() => setIsVisible(false)}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="glass-shimmer relative bg-white/20 border border-white/30 text-white font-bold rounded-lg px-4 py-2 backdrop-blur-md shadow-lg transition-all duration-200 w-full"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};

export default AccountEditModal; 