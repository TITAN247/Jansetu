import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getNotifications, markNotificationRead } from '../services/api';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (user?.id) {
            fetchNotifications();
            // Optional: Poll every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user?.id]);

    const fetchNotifications = async () => {
        try {
            const data = await getNotifications(user.id);
            setNotifications(data);
            const unread = data.filter(n => !n.is_read).length;
            setUnreadCount(unread);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await markNotificationRead(id);
            // Optimistic update
            setNotifications(prev => prev.map(n =>
                n._id === id ? { ...n, is_read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error(err);
        }
    };

    if (!user) return null;

    return (
        <div className="relative z-50">
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-blue-700 transition-colors"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden border border-gray-200"
                    >
                        <div className="p-3 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex justify-between items-center">
                            <span>Notifications</span>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 text-sm">Close</button>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 text-sm">No notifications yet.</div>
                            ) : (
                                notifications.map(n => (
                                    <div
                                        key={n._id}
                                        className={`p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-blue-50' : ''}`}
                                    >
                                        <p className="text-sm text-gray-800 mb-1">{n.message}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-xs text-gray-400">{new Date(n.created_at).toLocaleDateString()}</span>
                                            {!n.is_read && (
                                                <button
                                                    onClick={() => handleMarkRead(n._id)}
                                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Mark as Read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
