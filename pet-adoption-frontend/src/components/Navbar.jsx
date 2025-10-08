// frontend/src/components/Navbar.js
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isAuthenticated, isAdmin, isShelter, isUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <NavLink to="/" className="nav-logo">
                    Care4Pets🐕‍🦺
                </NavLink>

                <div className="nav-menu">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `nav-link ${isActive ? 'active' : ''}`
                        }
                    >
                        Home
                    </NavLink>

                    {/* Show Browse Pets only when user is authenticated */}
                    {isAuthenticated && (
                        <NavLink
                            to="/pets"
                            className={({ isActive }) =>
                                `nav-link ${isActive ? 'active' : ''}`
                            }
                        >
                            Browse Pets
                        </NavLink>
                    )}

                    {isAuthenticated ? (
                        <>
                            {/* User specific links */}
                            {isUser && (
                                <NavLink
                                    to="/my-requests"
                                    className={({ isActive }) =>
                                        `nav-link ${isActive ? 'active' : ''}`
                                    }
                                >
                                    My Requests
                                </NavLink>
                            )}

                            {/* Shelter specific links */}
                            {isShelter && (
                                <>
                                    <NavLink
                                        to="/add-pet"
                                        className={({ isActive }) =>
                                            `nav-link ${isActive ? 'active' : ''}`
                                        }
                                    >
                                        Add Pet
                                    </NavLink>
                                    <NavLink
                                        to="/manage-requests"
                                        className={({ isActive }) =>
                                            `nav-link ${isActive ? 'active' : ''}`
                                        }
                                    >
                                        Manage Requests
                                    </NavLink>
                                </>
                            )}

                            {/* Admin specific links */}
                            {isAdmin && (
                                <>
                                    <NavLink
                                        to="/admin/dashboard"
                                        className={({ isActive }) =>
                                            `nav-link ${isActive ? 'active' : ''}`
                                        }
                                    >
                                        Dashboard
                                    </NavLink>
                                    <NavLink
                                        to="/admin/reports"
                                        className={({ isActive }) =>
                                            `nav-link ${isActive ? 'active' : ''}`
                                        }
                                    >
                                        Reports
                                    </NavLink>
                                    <NavLink
                                        to="/manage-requests"
                                        className={({ isActive }) =>
                                            `nav-link ${isActive ? 'active' : ''}`
                                        }
                                    >
                                        Manage Requests
                                    </NavLink>
                                </>
                            )}

                            {/* My Profile link - shown to all authenticated users */}
                            <NavLink
                                to="/profile"
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? 'active' : ''}`
                                }
                            >
                                My Profile
                            </NavLink>

                            <div className="user-info">
                                <span className="user-role">
                                    {isAdmin ? 'Admin' : isShelter ? 'Shelter' : 'User'}
                                </span>
                                <button onClick={handleLogout} className="logout-btn">
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Show only Login and Register when not authenticated */}
                            <NavLink
                                to="/login"
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? 'active' : ''}`
                                }
                            >
                                Login
                            </NavLink>
                            <NavLink
                                to="/register"
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? 'active' : ''}`
                                }
                            >
                                Register
                            </NavLink>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;