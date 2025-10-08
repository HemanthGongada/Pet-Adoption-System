// frontend/src/pages/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

// SVG Icons for show/hide password
const EyeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'USER',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        contactEmail: '',
        contactNumber: '',
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await authAPI.register(formData);
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const getRoleContent = () => {
        if (formData.role === 'SHELTER') {
            return {
                image: '🏠',
                title: 'Join as a Shelter Partner',
                description: 'Connect with potential adopters and find loving homes for your animals.',
                features: [
                    'Manage your shelter animals',
                    'Connect with potential adopters',
                    'Streamline adoption process',
                    'Get community support'
                ]
            };
        } else {
            return {
                image: '🐕‍🦺',
                title: 'Join as a Pet Lover',
                description: 'Find your perfect furry friend and give them a forever home.',
                features: [
                    'Browse available pets',
                    'Connect with shelters',
                    'Schedule visits',
                    'Make a difference'
                ]
            };
        }
    };

    const roleContent = getRoleContent();

    return (
        <div className="auth-container">
            <div className="auth-background"></div>
            <div className="auth-wrapper">
                {/* Left Side - Form */}
                <div className="auth-form-side">
                    <div className="auth-header">
                        <div className="auth-logo">Care4Pets</div>
                        <h2 className="auth-subtitle">Create Your Account</h2>
                        <p className="auth-description">Join our community and make a difference in pets' lives.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="form-control"
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="form-control form-control-select"
                                    required
                                >
                                    <option value="USER">Pet Lover</option>
                                    <option value="SHELTER">Shelter</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Enter your email address"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="password-input-container">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="form-control"
                                    placeholder="Create a secure password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={togglePasswordVisibility}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>

                        {formData.role === 'SHELTER' && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Shelter Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder="Enter shelter street address"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="form-control"
                                            placeholder="City"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">State</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            className="form-control"
                                            placeholder="State"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Zip Code</label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            value={formData.zipCode}
                                            onChange={handleChange}
                                            className="form-control"
                                            placeholder="Zip code"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Contact Number</label>
                                        <input
                                            type="text"
                                            name="contactNumber"
                                            value={formData.contactNumber}
                                            onChange={handleChange}
                                            className="form-control"
                                            placeholder="Phone number"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Contact Email</label>
                                    <input
                                        type="email"
                                        name="contactEmail"
                                        value={formData.contactEmail}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder="Contact email (optional)"
                                    />
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`auth-submit-btn ${loading ? 'loading' : ''}`}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="auth-link">
                        Already have an account? <Link to="/login">Sign in here</Link>
                    </div>
                </div>

                {/* Right Side - Content */}
                <div className="auth-content-side">
                    <div className="auth-content">
                        <div className="auth-image">{roleContent.image}</div>
                        <h3>{roleContent.title}</h3>
                        <p>{roleContent.description}</p>

                        <div className="features-list">
                            {roleContent.features.map((feature, index) => (
                                <div key={index} className="feature-item">
                                    <div className="feature-icon">✓</div>
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;