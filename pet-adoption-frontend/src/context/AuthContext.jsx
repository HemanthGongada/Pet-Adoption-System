// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, adoptionAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRequests, setUserRequests] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            decodeTokenAndSetUser(token);
            fetchUserRequests(); // Fetch user requests on login
        }
        setLoading(false);
    }, []);

    const decodeToken = (token) => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    };

    const decodeTokenAndSetUser = (token) => {
        const decoded = decodeToken(token);
        if (decoded) {
            setUser({ token, email: decoded.sub });
            setUserRole(decoded.roles);
        }
    };

    const fetchUserRequests = async () => {
        try {
            const response = await adoptionAPI.getUserRequests();
            setUserRequests(response.data);
        } catch (error) {
            console.error('Error fetching user requests:', error);
        }
    };

    const login = (token) => {
        localStorage.setItem('token', token);
        decodeTokenAndSetUser(token);
        fetchUserRequests(); // Fetch requests after login
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setUserRole(null);
        setUserRequests([]); // Clear requests on logout
    };

    const addUserRequest = (request) => {
        setUserRequests(prev => [...prev, request]);
    };

    const updateUserRequest = (updatedRequest) => {
        setUserRequests(prev =>
            prev.map(req =>
                req.id === updatedRequest.id ? updatedRequest : req
            )
        );
    };

    const hasPendingRequestForPet = (petId) => {
        return userRequests.some(request =>
            request.petId === petId &&
            // Only block if status is NOT completed, rejected, or cancelled
            !['COMPLETED', 'REJECTED', 'CANCELLED'].includes(request.status)
        );
    };

    const hasCompletedRequestForPet = (petId) => {
        return userRequests.some(request =>
            request.petId === petId &&
            request.status === 'COMPLETED'
        );
    };

    const getRequestForPet = (petId) => {
        return userRequests.find(request => request.petId === petId);
    };

    // REMOVE THE DUPLICATE value OBJECT AND USE THIS SINGLE ONE:
    const value = {
        user,
        userRole,
        login,
        logout,
        loading,
        userRequests,
        addUserRequest,
        updateUserRequest,
        hasPendingRequestForPet,
        hasCompletedRequestForPet,
        getRequestForPet,
        refreshUserRequests: fetchUserRequests,
        isAuthenticated: !!user,
        isAdmin: userRole === 'ROLE_ADMIN',
        isShelter: userRole === 'ROLE_SHELTER',
        isUser: userRole === 'ROLE_USER'
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};