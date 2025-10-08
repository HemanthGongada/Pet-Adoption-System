import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { toast } from 'react-toastify';

const Profile = () => {
    const { user, isAdmin, isShelter, isUser } = useAuth();
    const [activeTab, setActiveTab] = useState('info');
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        contactEmail: '',
        contactNumber: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await userAPI.getProfile();
            setProfile(response.data);
            setFormData({
                name: response.data.name || '',
                address: response.data.address || '',
                city: response.data.city || '',
                state: response.data.state || '',
                zipCode: response.data.zipCode || '',
                contactEmail: response.data.contactEmail || '',
                contactNumber: response.data.contactNumber || '',
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: '',
            });
        } catch (error) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (isEditing) {
            // If canceling edit, reset form data
            setFormData({
                name: profile.name || '',
                address: profile.address || '',
                city: profile.city || '',
                state: profile.state || '',
                zipCode: profile.zipCode || '',
                contactEmail: profile.contactEmail || '',
                contactNumber: profile.contactNumber || '',
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: '',
            });
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            await userAPI.updateProfile(formData);
            toast.success('Profile updated successfully');
            setIsEditing(false);
            fetchProfile();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmNewPassword) {
            toast.error('New passwords do not match');
            return;
        }
        try {
            await userAPI.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });
            toast.success('Password updated successfully');
            setFormData({
                ...formData,
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: '',
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update password');
        }
    };

    if (loading) {
        return <div className="container loading-state">Loading profile...</div>;
    }

    return (
        <div className="container">
            <div className="page-header">
                <h1>My Profile</h1>
                <span className={`role-badge role-${profile?.role?.toLowerCase()}`}>
                    {profile?.role}
                </span>
            </div>

            <div className="profile-tabs">
                <button
                    className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                    onClick={() => setActiveTab('info')}
                >
                    Profile Info
                </button>
                <button
                    className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
                    onClick={() => setActiveTab('password')}
                >
                    Change Password
                </button>
            </div>

            {activeTab === 'info' && (
                <div className="info-card">
                    <div className="profile-header">
                        <h2>Profile Information</h2>
                        {/* Show Edit button only for Shelter and Admin roles */}
                        {(isShelter || isAdmin) && (
                            <button
                                type="button"
                                className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
                                onClick={handleEditToggle}
                            >
                                {isEditing ? 'Cancel' : 'Edit Profile'}
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleProfileSubmit}>
                        {/* Email field - always read-only */}
                        <div className="info-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={profile?.email || user?.email || ''}
                                className="form-control"
                                readOnly
                                disabled
                                style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                            />
                            <small className="text-muted">Email cannot be changed</small>
                        </div>

                        <div className="info-group">
                            <label>Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-control"
                                required
                                readOnly={!isEditing}
                                disabled={!isEditing}
                                style={!isEditing ? { backgroundColor: '#f8f9fa', cursor: 'not-allowed' } : {}}
                            />
                        </div>

                        {/* Shelter/Admin specific fields */}
                        {(isShelter || isAdmin) && (
                            <>
                                <div className="info-group">
                                    <label>Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="form-control"
                                        readOnly={!isEditing}
                                        disabled={!isEditing}
                                        style={!isEditing ? { backgroundColor: '#f8f9fa', cursor: 'not-allowed' } : {}}
                                    />
                                </div>
                                <div className="info-group">
                                    <label>City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="form-control"
                                        readOnly={!isEditing}
                                        disabled={!isEditing}
                                        style={!isEditing ? { backgroundColor: '#f8f9fa', cursor: 'not-allowed' } : {}}
                                    />
                                </div>
                                <div className="info-group">
                                    <label>State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className="form-control"
                                        readOnly={!isEditing}
                                        disabled={!isEditing}
                                        style={!isEditing ? { backgroundColor: '#f8f9fa', cursor: 'not-allowed' } : {}}
                                    />
                                </div>
                                <div className="info-group">
                                    <label>Zip Code</label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={handleChange}
                                        className="form-control"
                                        readOnly={!isEditing}
                                        disabled={!isEditing}
                                        style={!isEditing ? { backgroundColor: '#f8f9fa', cursor: 'not-allowed' } : {}}
                                    />
                                </div>
                                <div className="info-group">
                                    <label>Contact Email</label>
                                    <input
                                        type="email"
                                        name="contactEmail"
                                        value={formData.contactEmail}
                                        onChange={handleChange}
                                        className="form-control"
                                        readOnly={!isEditing}
                                        disabled={!isEditing}
                                        style={!isEditing ? { backgroundColor: '#f8f9fa', cursor: 'not-allowed' } : {}}
                                    />
                                </div>
                                <div className="info-group">
                                    <label>Contact Number</label>
                                    <input
                                        type="text"
                                        name="contactNumber"
                                        value={formData.contactNumber}
                                        onChange={handleChange}
                                        className="form-control"
                                        readOnly={!isEditing}
                                        disabled={!isEditing}
                                        style={!isEditing ? { backgroundColor: '#f8f9fa', cursor: 'not-allowed' } : {}}
                                    />
                                </div>
                            </>
                        )}

                        {/* Save button only shows when editing */}
                        {isEditing && (
                            <div className="profile-actions">
                                <button type="submit" className="btn btn-success">
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            )}

            {activeTab === 'password' && (
                <div className="info-card">
                    <h2>Change Password</h2>
                    <form onSubmit={handlePasswordSubmit}>
                        <div className="info-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="info-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="info-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmNewPassword"
                                value={formData.confirmNewPassword}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="profile-actions">
                            <button type="submit" className="btn btn-primary">
                                Change Password
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Profile;