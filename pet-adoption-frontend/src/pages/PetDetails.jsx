// frontend/src/pages/PetDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { petAPI, adoptionAPI } from '../services/api'; // ADD adoptionAPI import
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './PetDetails.css';

const PetDetails = () => {
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, isUser, hasPendingRequestForPet, getRequestForPet } = useAuth();

    useEffect(() => {
        fetchPetDetails();
    }, [id]);

    const fetchPetDetails = async () => {
        try {
            const response = await petAPI.getPetById(id);
            setPet(response.data);
        } catch (error) {
            console.error('Error fetching pet details:', error);
            toast.error('Failed to load pet details');
            navigate('/pets');
        } finally {
            setLoading(false);
        }
    };

    const handleAdopt = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to adopt a pet');
            navigate('/login');
            return;
        }

        try {
            await adoptionAPI.createRequest({ petId: id });
            toast.success(`Adoption request sent for ${pet.name}!`);
            // Refresh the page to update the request status
            window.location.reload();
        } catch (error) {
            console.error('Adoption error:', error);
            toast.error(error.response?.data?.message || 'Failed to send adoption request');
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading pet details...</p>
                </div>
            </div>
        );
    }

    if (!pet) {
        return (
            <div className="container">
                <div className="error-state">
                    <h3>Pet Not Found</h3>
                    <p>The pet you're looking for doesn't exist.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/pets')}>
                        Back to Pets
                    </button>
                </div>
            </div>
        );
    }

    const userRequest = getRequestForPet(pet.id);

    return (
        <div className="pet-details-container">
            <div className="container">
                <button className="btn btn-back" onClick={() => navigate('/pets')}>
                    ← Back to All Pets
                </button>

                <div className="pet-details-card">
                    <div className="pet-details-header">
                        <h1>{pet.name}</h1>
                        <span className={`pet-status status-${pet.status?.toLowerCase()}`}>
                            {pet.status}
                        </span>
                    </div>

                    <div className="pet-details-content">
                        <div className="pet-image-section">
                            {pet.photoUrl ? (
                                <img
                                    src={`http://localhost:8080${pet.photoUrl}`}
                                    alt={pet.name}
                                    className="pet-detail-image"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div className="no-image-placeholder" style={{display: pet.photoUrl ? 'none' : 'flex'}}>
                                🐾 No Image Available
                            </div>
                        </div>

                        <div className="pet-info-section">
                            <div className="pet-info-grid">
                                <div className="info-item">
                                    <span className="info-label">Pet ID:</span>
                                    <span className="info-value">{pet.id}</span> {/* ADDED PET ID */}
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Type:</span>
                                    <span className="info-value">{pet.type}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Breed:</span>
                                    <span className="info-value">{pet.breed}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Age:</span>
                                    <span className="info-value">{pet.age} years</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Status:</span>
                                    <span className={`info-value status-${pet.status?.toLowerCase()}`}>
                                        {pet.status}
                                    </span>
                                </div>
                                <div className="info-item full-width">
                                    <span className="info-label">Shelter ID:</span>
                                    <span className="info-value">{pet.shelterId}</span>
                                </div>

                                {/* Show user's request status if exists */}
                                {userRequest && (
                                    <div className="info-item full-width">
                                        <span className="info-label">Your Request Status:</span>
                                        <span className={`info-value status-${userRequest.status?.toLowerCase()}`}>
                                            {userRequest.status} (Request ID: {userRequest.id})
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="pet-description">
                                <h3>About {pet.name}</h3>
                                <p>{pet.description}</p>
                            </div>


                            <div className="pet-actions">
                                {isAuthenticated && isUser && pet.status === 'AVAILABLE' && (
                                    <>
                                        {/* Show adopt button if no pending request OR if request is completed */}
                                        {(!hasPendingRequestForPet(pet.id) || (userRequest && userRequest.status === 'COMPLETED')) && (
                                            <button className="btn btn-adopt-large" onClick={handleAdopt}>
                                                {userRequest && userRequest.status === 'COMPLETED' ? 'Adopt Again' : `Adopt ${pet.name}`}
                                            </button>
                                        )}
                                    </>
                                )}

                                {isAuthenticated && isUser && hasPendingRequestForPet(pet.id) && userRequest && userRequest.status !== 'COMPLETED' && (
                                    <div className="request-status-card">
                                        <h4>Adoption Request Status</h4>
                                        <p>Your request for {pet.name} is <strong>{userRequest?.status}</strong></p>
                                        <p><small>Request ID: {userRequest?.id}</small></p>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => navigate('/my-requests')}
                                        >
                                            View My Requests
                                        </button>
                                    </div>
                                )}

                                {isAuthenticated && isUser && userRequest && userRequest.status === 'COMPLETED' && (
                                    <div className="completed-adoption-card">
                                        <h4>🎉 Adoption Completed!</h4>
                                        <p>You've successfully adopted {pet.name}! You can adopt another pet if you'd like.</p>
                                    </div>
                                )}

                                {pet.status !== 'AVAILABLE' && !hasPendingRequestForPet(pet.id) && (
                                    <div className="not-available">
                                        <p>This pet is currently {pet.status.toLowerCase()} and not available for adoption.</p>
                                    </div>
                                )}

                                {!isAuthenticated && (
                                    <button
                                        className="btn btn-login"
                                        onClick={() => navigate('/login')}
                                    >
                                        🔐 Login to Adopt
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PetDetails;