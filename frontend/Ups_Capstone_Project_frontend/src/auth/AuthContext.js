import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check for token in localStorage on initial load
        const token = localStorage.getItem('access_token');
        if (token) {
            setIsAuthenticated(true);
            // In a real app, you'd decode the token or fetch user data
            // For now, let's just assume a generic user if token exists
            setUser({ username: 'Authenticated User' }); 
        }
    }, []);

    const login = (token, userData) => {
        localStorage.setItem('access_token', token);
        setIsAuthenticated(true);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext); 