// frontend/src/pages/AdminReports.js
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import './AdminReports.css';

const AdminReports = () => {
    const [reports, setReports] = useState({
        adoptions: null,
        users: null,
        pets: null
    });
    const [activeTab, setActiveTab] = useState('adoptions');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const [adoptionsRes, usersRes, petsRes] = await Promise.all([
                adminAPI.getAdoptionReports(),
                adminAPI.getUserReports(),
                adminAPI.getPetReports()
            ]);

            setReports({
                adoptions: adoptionsRes.data,
                users: usersRes.data,
                pets: petsRes.data
            });
        } catch (error) {
            console.error('Error fetching reports:', error);
        }
    };

    const renderAdoptionReports = () => (
        <div className="report-section">
            <h3>Adoption Reports</h3>
            <div className="report-cards">
                <div className="report-card">
                    <h4>Total Requests</h4>
                    <p className="stat">{reports.adoptions?.totalRequests}</p>
                </div>
                <div className="report-card">
                    <h4>Pending</h4>
                    <p className="stat pending">{reports.adoptions?.pendingRequests}</p>
                </div>
                <div className="report-card">
                    <h4>Approved</h4>
                    <p className="stat approved">{reports.adoptions?.approvedRequests}</p>
                </div>
                <div className="report-card">
                    <h4>Rejected</h4>
                    <p className="stat rejected">{reports.adoptions?.rejectedRequests}</p>
                </div>
            </div>
        </div>
    );

    const renderUserReports = () => (
        <div className="report-section">
            <h3>User Reports</h3>
            <div className="report-cards">
                <div className="report-card">
                    <h4>Total Users</h4>
                    <p className="stat">{reports.users?.totalUsers}</p>
                </div>
                <div className="report-card">
                    <h4>Regular Users</h4>
                    <p className="stat">{reports.users?.regularUsers}</p>
                </div>
                <div className="report-card">
                    <h4>Shelters</h4>
                    <p className="stat">{reports.users?.shelters}</p>
                </div>
                <div className="report-card">
                    <h4>Admins</h4>
                    <p className="stat">{reports.users?.admins}</p>
                </div>
            </div>
        </div>
    );

    const renderPetReports = () => (
        <div className="report-section">
            <h3>Pet Reports</h3>
            <div className="report-cards">
                <div className="report-card">
                    <h4>Total Pets</h4>
                    <p className="stat">{reports.pets?.totalPets}</p>
                </div>
                <div className="report-card">
                    <h4>Available</h4>
                    <p className="stat available">{reports.pets?.availablePets}</p>
                </div>
                <div className="report-card">
                    <h4>Adopted</h4>
                    <p className="stat adopted">{reports.pets?.adoptedPets}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="admin-reports">
            <div className="container">
                <h1>Admin Reports</h1>

                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'adoptions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('adoptions')}
                    >
                        Adoption Reports
                    </button>
                    <button
                        className={`tab ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        User Reports
                    </button>
                    <button
                        className={`tab ${activeTab === 'pets' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pets')}
                    >
                        Pet Reports
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === 'adoptions' && renderAdoptionReports()}
                    {activeTab === 'users' && renderUserReports()}
                    {activeTab === 'pets' && renderPetReports()}
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
