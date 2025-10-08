// frontend/src/pages/Pets.js - Updated version
import React, { useState, useEffect } from 'react';
import { petAPI, adoptionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './Pets.css';

const Pets = () => {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const {
        user,
        isAuthenticated,
        userRole,
        hasPendingRequestForPet,
        getRequestForPet,
        addUserRequest,
        updateUserRequest,
        refreshUserRequests
    } = useAuth();
    const navigate = useNavigate();

    const getUserRole = () => {
        if (user?.role) return user.role;
        if (userRole) return userRole;
        if (user?.userRole) return user.userRole;

        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.roles) return payload.roles;
                if (payload.role) return payload.role;
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        }
        return null;
    };

    const currentUserRole = getUserRole();
    const isAdmin = currentUserRole?.includes('ADMIN') || currentUserRole === 'ADMIN' || currentUserRole === 'ROLE_ADMIN';
    const isShelter = currentUserRole?.includes('SHELTER') || currentUserRole === 'SHELTER' || currentUserRole === 'ROLE_SHELTER';
    const isUser = currentUserRole?.includes('USER') || currentUserRole === 'USER' || currentUserRole === 'ROLE_USER';

    useEffect(() => {
        fetchPets();
    }, []);

    const fetchPets = async () => {
        try {
            const response = await petAPI.getAllPets();
            setPets(response.data);
        } catch (error) {
            console.error('Error fetching pets:', error);
            toast.error('Failed to load pets');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (petId) => {
        const petToDelete = pets.find(p => p.id === petId);
        if (!window.confirm(`Are you sure you want to delete "${petToDelete.name}"? This action cannot be undone.`)) {
            return;
        }

        setDeleteLoading(petId);
        try {
            await petAPI.deletePet(petId);
            toast.success(`"${petToDelete.name}" has been deleted successfully!`);
            setPets(pets.filter(pet => pet.id !== petId));
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete pet');
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleEdit = (pet) => {
        navigate(`/edit-pet/${pet.id}`);
    };

    const handleAdopt = async (petId) => {
        const petToAdopt = pets.find(p => p.id === petId);

        if (!isAuthenticated) {
            toast.error('Please login to adopt a pet');
            navigate('/login');
            return;
        }

        try {
            const response = await adoptionAPI.createRequest({ petId });
            const newRequest = response.data;

            addUserRequest(newRequest);

            setPets(pets.map(pet =>
                pet.id === petId ? { ...pet, status: 'PENDING' } : pet
            ));

            toast.success(`Adoption request sent for ${petToAdopt.name}!`);

            // Refresh user requests to ensure data is current
            refreshUserRequests();
        } catch (error) {
            console.error('Adoption error:', error);
            toast.error(error.response?.data?.message || 'Failed to send adoption request');
        }
    };

    const canEditDelete = (pet) => {
        if (isAdmin) return true;
        if (isShelter && pet.shelterId === user?.id) return true;
        return false;
    };

    // frontend/src/pages/Pets.js - Update the getAdoptionButtonState function

    const getAdoptionButtonState = (pet) => {
        if (!isAuthenticated || !isUser) return null;

        if (pet.status !== 'AVAILABLE') {
            return {
                show: false,
                reason: `This pet is ${pet.status.toLowerCase()}`
            };
        }

        if (hasPendingRequestForPet(pet.id)) {
            const request = getRequestForPet(pet.id);
            // Only show adopt button if request is completed
            if (request.status === 'COMPLETED') {
                return {
                    show: true,
                    reason: null,
                    isCompletedAdoption: true
                };
            }
            return {
                show: false,
                reason: `Request ${request.status.toLowerCase()}`,
                requestStatus: request.status,
                requestId: request.id
            };
        }

        return {
            show: true,
            reason: null
        };
    };

    const scrollToRequest = (requestId) => {
        navigate('/my-requests', {
            state: { scrollToRequest: requestId }
        });
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading pets...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="pets-header">
                <h1>Available Pets</h1>
                <p>Find your perfect furry companion</p>

                {(isAdmin || isShelter) && (
                    <button
                        className="btn btn-primary add-pet-btn"
                        onClick={() => navigate('/add-pet')}
                    >
                        ➕ Add New Pet
                    </button>
                )}
            </div>

            {pets.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🐾</div>
                    <h3>No Pets Available</h3>
                    <p>There are currently no pets available for adoption.</p>
                    {(isAdmin || isShelter) && (
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/add-pet')}
                        >
                            Add Your First Pet
                        </button>
                    )}
                </div>
            ) : (
                <div className="pets-grid">
                    {pets.map((pet) => {
                        const adoptionButtonState = getAdoptionButtonState(pet);
                        const userRequest = getRequestForPet(pet.id);

                        return (
                            <div key={pet.id} className="pet-card">
                                <div className="pet-image-container">
                                    {pet.photoUrl ? (
                                        <img
                                            src={`http://localhost:8080${pet.photoUrl}`}
                                            alt={pet.name}
                                            className="pet-image"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                const placeholder = e.target.parentElement.querySelector('.no-image-placeholder');
                                                if (placeholder) {
                                                    placeholder.style.display = 'flex';
                                                }
                                            }}
                                        />
                                    ) : null}

                                    <div className="no-image-placeholder" style={{display: pet.photoUrl ? 'none' : 'flex'}}>
                                        🐾 No Image
                                    </div>

                                    <div className={`pet-status-badge status-${pet.status?.toLowerCase()}`}>
                                        {pet.status}
                                    </div>
                                </div>

                                <div className="pet-info">
                                    <h3>{pet.name}</h3>
                                    <div className="pet-details">
                                        <div className="detail-item">
                                            <span className="detail-label">Pet ID:</span> {/* ADDED PET ID */}
                                            <span className="detail-value">{pet.id}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Type:</span>
                                            <span className="detail-value">{pet.type}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Breed:</span>
                                            <span className="detail-value">{pet.breed}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Age:</span>
                                            <span className="detail-value">{pet.age} years</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Status:</span>
                                            <span className={`status-value status-${pet.status?.toLowerCase()}`}>
                                                {pet.status}
                                            </span>
                                        </div>
                                        {/* Show request status if user has a request for this pet */}
                                        {userRequest && (
                                            <div className="detail-item full-width">
                                                <span className="detail-label">Your Request:</span>
                                                <span className={`status-value status-${userRequest.status?.toLowerCase()}`}>
                                                    {userRequest.status} (ID: {userRequest.id})
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <p className="pet-description">{pet.description}</p>

                                    {/* Action Buttons */}
                                    <div className="pet-actions">
                                        {/* Adopt button with enhanced logic */}

                                        {/* Adopt button with enhanced logic */}
                                        {adoptionButtonState?.show ? (
                                            <button
                                                className={`btn ${adoptionButtonState.isCompletedAdoption ? 'btn-success' : 'btn-adopt'}`}
                                                onClick={() => handleAdopt(pet.id)}
                                            >
                                                {adoptionButtonState.isCompletedAdoption ? 'Adopt Again' : 'Adopt Me'}
                                            </button>
                                        ) : adoptionButtonState?.reason ? (
                                            <div className="request-status-info">
        <span className="status-message">
            {adoptionButtonState.reason}
        </span>
                                                {userRequest && userRequest.status !== 'COMPLETED' && (
                                                    <button
                                                        className="btn btn-outline view-request"
                                                        onClick={() => scrollToRequest(userRequest.id)}
                                                    >
                                                        View Request ID {userRequest.id}
                                                    </button>
                                                )}
                                                {userRequest && userRequest.status === 'COMPLETED' && (
                                                    <div className="completed-message">
                                                         Adoption completed! You can adopt another pet.
                                                    </div>
                                                )}
                                            </div>
                                        ) : null}

                                        {/* Edit and Delete buttons */}
                                        {canEditDelete(pet) && (
                                            <div className="management-actions">
                                                <button
                                                    className="btn btn-edit"
                                                    onClick={() => handleEdit(pet)}
                                                    disabled={deleteLoading === pet.id}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-delete"
                                                    onClick={() => handleDelete(pet.id)}
                                                    disabled={deleteLoading === pet.id}
                                                >
                                                    {deleteLoading === pet.id ? 'Deleting...' : 'Delete'}
                                                </button>
                                            </div>
                                        )}

                                        {/* View details button */}
                                        <button
                                            className="btn btn-outline view-details"
                                            onClick={() => navigate(`/pet-details/${pet.id}`)}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Pets;