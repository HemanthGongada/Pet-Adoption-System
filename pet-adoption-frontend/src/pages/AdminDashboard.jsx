// frontend/src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ADD THIS IMPORT
import { adminAPI } from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // ADD THIS HOOK

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await adminAPI.getDashboard();
            setDashboardData(response.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="container">Loading dashboard...</div>;
    }

    return (
        <div className="admin-dashboard">
            <div className="container">
                <h1>Admin Dashboard</h1>

                {/* Stats Cards */}
                <div className="stats-cards">
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                            <h3>{dashboardData?.totalUsers}</h3>
                            <p>Total Users</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🐾</div>
                        <div className="stat-info">
                            <h3>{dashboardData?.totalPets}</h3>
                            <p>Total Pets</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🏠</div>
                        <div className="stat-info">
                            <h3>{dashboardData?.totalAdoptions}</h3>
                            <p>Total Adoptions</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-info">
                            <h3>{dashboardData?.pendingAdoptions}</h3>
                            <p>Pending Requests</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions - UPDATED WITH ADD PET BUTTON */}
                <div className="dashboard-actions">
                    <h2>Quick Actions</h2>
                    <div className="action-buttons">
                        {/* ADD THIS NEW BUTTON */}
                        <button className="action-btn" onClick={() => navigate('/add-pet')}>
                            ➕ Add New Pet
                        </button>
                        <button className="action-btn" onClick={() => navigate('/admin/reports')}>
                            📊 View Reports
                        </button>
                        <button className="action-btn" onClick={() => navigate('/manage-requests')}>
                            📋 Manage Requests
                        </button>
                        <button className="action-btn" onClick={() => navigate('/pets')}>
                            🐕 View All Pets
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;