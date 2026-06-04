import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const res = await auth.user();
            setUser(res.data.data);
        } catch {
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const login = async (email, password) => {
        const res = await auth.login({ email, password });
        const { token: newToken, user: userData } = res.data.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        return res.data;
    };

    const register = async (data) => {
        const res = await auth.register(data);
        const { token: newToken, user: userData } = res.data.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        return res.data;
    };

    const logout = async () => {
        try {
            await auth.logout();
        } catch {
            //
        }
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user, token, loading, login, register, logout, fetchUser,
            isAuthenticated: !!token && !!user,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
