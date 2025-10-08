// frontend/src/pages/MyRequests.js - Enhanced version with Filter
import React, { useState, useEffect, useRef } from 'react';
import { adoptionAPI, appointmentAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import BookAppointment from './BookAppointment';

const MyRequests = () => {
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBookModal, setShowBookModal] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const requestRefs = useRef({});
    const location = useLocation();
    const navigate = useNavigate();

    // Status options for filter
    const statusOptions = [
        { value: 'ALL', label: 'All Requests', count: 0 },
        { value: 'PENDING', label: 'Pending', count: 0 },
        { value: 'APPROVED', label: 'Approved', count: 0 },
        { value: 'IN_PROGRESS', label: 'In Progress', count: 0 },
        { value: 'COMPLETED', label: 'Completed', count: 0 },
        { value: 'REJECTED', label: 'Rejected', count: 0 },
        { value: 'CANCELLED', label: 'Cancelled', count: 0 }
    ];

    useEffect(() => {
        fetchRequests();
        fetchAppointments();
    }, []);

    // Update filtered requests when requests or filter changes
    useEffect(() => {
        if (requests.length > 0) {
            filterRequests();
        }
    }, [requests, statusFilter]);

    // Scroll to specific request if provided in navigation state
    useEffect(() => {
        if (location.state?.scrollToRequest) {
            const requestId = location.state.scrollToRequest;
            setTimeout(() => {
                scrollToRequest(requestId);
            }, 500); // Small delay to ensure DOM is rendered
        }
    }, [location.state, filteredRequests]);

    const fetchRequests = async () => {
        try {
            const response = await adoptionAPI.getUserRequests();
            // Sort requests by newest first
            const sortedRequests = response.data.sort((a, b) =>
                new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id)
            );
            setRequests(sortedRequests);
        } catch (error) {
            toast.error('Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    const fetchAppointments = async () => {
        try {
            const response = await appointmentAPI.getUserAppointments();
            setAppointments(response.data);
        } catch (error) {
            toast.error('Failed to load appointments');
        }
    };

    const filterRequests = () => {
        if (statusFilter === 'ALL') {
            setFilteredRequests(requests);
        } else {
            const filtered = requests.filter(request => request.status === statusFilter);
            setFilteredRequests(filtered);
        }
    };

    // Update status counts
    const getStatusCounts = () => {
        const counts = {
            ALL: requests.length,
            PENDING: requests.filter(r => r.status === 'PENDING').length,
            APPROVED: requests.filter(r => r.status === 'APPROVED').length,
            IN_PROGRESS: requests.filter(r => r.status === 'IN_PROGRESS').length,
            COMPLETED: requests.filter(r => r.status === 'COMPLETED').length,
            REJECTED: requests.filter(r => r.status === 'REJECTED').length,
            CANCELLED: requests.filter(r => r.status === 'CANCELLED').length
        };
        return statusOptions.map(option => ({
            ...option,
            count: counts[option.value]
        }));
    };

    const handleBookAppointment = (requestId) => {
        setSelectedRequestId(requestId);
        setShowBookModal(true);
    };

    const getAppointmentDetails = (requestId) => {
        return appointments.find((appt) => appt.adoptionRequestId === requestId);
    };

    const scrollToRequest = (requestId) => {
        const element = requestRefs.current[requestId];
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });

            // Add highlight effect
            element.style.backgroundColor = '#e7f3ff';
            setTimeout(() => {
                element.style.backgroundColor = '';
            }, 2000);
        }
    };

    const handleViewAppointment = (appointmentId) => {
        const appointment = appointments.find(appt => appt.id === appointmentId);
        if (appointment) {
            const appointmentDetails = `
Appointment Details:
- ID: ${appointment.id}
- Visitor: ${appointment.visitorName}
- Number of Visitors: ${appointment.numberOfVisitors}
- Date: ${new Date(appointment.appointmentDateTime).toLocaleString()}
- Status: ${appointment.status}
            `;
            alert(appointmentDetails);
        } else {
            toast.error('Appointment details not found');
        }
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'APPROVED': return 'info';
            case 'IN_PROGRESS': return 'primary';
            case 'COMPLETED': return 'success';
            case 'REJECTED': return 'danger';
            case 'CANCELLED': return 'secondary';
            default: return 'secondary';
        }
    };

    const canBookAppointment = (request, appointment) => {
        return request.status === 'APPROVED' && !appointment;
    };

    const getNextAction = (request, appointment) => {
        if (!appointment) {
            if (request.status === 'PENDING') {
                return { type: 'pending', message: 'Waiting for approval' };
            }
            if (request.status === 'APPROVED') {
                return { type: 'book', message: 'Ready to book appointment' };
            }
            if (request.status === 'REJECTED') {
                return { type: 'rejected', message: 'Request was rejected' };
            }
            if (request.status === 'COMPLETED') {
                return { type: 'completed', message: 'Adoption completed!' };
            }
        } else {
            return { type: 'appointment', message: `Appointment: ${appointment.status}` };
        }
        return { type: 'unknown', message: 'Processing...' };
    };

    if (loading) {
        return (
            <div className="container loading-state">
                <div className="loading-spinner"></div>
                <p>Loading requests...</p>
            </div>
        );
    }

    const statusCounts = getStatusCounts();

    return (
        <div className="container">
            <div className="page-header">
                <h1>My Adoption Requests</h1>
                <div className="header-stats">
                    <span className="stat-badge total">Total: {requests.length}</span>
                    <span className="stat-badge pending">
                        Pending: {requests.filter(r => r.status === 'PENDING').length}
                    </span>
                    <span className="stat-badge approved">
                        Approved: {requests.filter(r => r.status === 'APPROVED').length}
                    </span>
                    <span className="stat-badge completed">
                        Completed: {requests.filter(r => r.status === 'COMPLETED').length}
                    </span>
                </div>
            </div>

            {/* Filter Section */}
            <div className="filter-section">
                <div className="filter-header">
                    <h3>Filter Requests</h3>
                    <div className="filter-controls">
                        <div className="filter-group">
                            <label htmlFor="status-filter" className="filter-label">
                                Status Filter:
                            </label>
                            <div className="custom-select">
                                <select
                                    id="status-filter"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="status-filter-dropdown"
                                >
                                    {statusCounts.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label} ({option.count})
                                        </option>
                                    ))}
                                </select>
                                <span className="select-arrow">▼</span>
                            </div>
                        </div>
                        <div className="filter-info">
                            <span className="showing-text">
                                Showing {filteredRequests.length} of {requests.length} requests
                            </span>
                            {statusFilter !== 'ALL' && (
                                <button
                                    className="btn btn-outline clear-filter"
                                    onClick={() => setStatusFilter('ALL')}
                                >
                                    Clear Filter
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {filteredRequests.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">
                        {statusFilter === 'ALL' ? '📋' : '🔍'}
                    </div>
                    <h3>
                        {statusFilter === 'ALL'
                            ? 'No Adoption Requests'
                            : `No ${statusCounts.find(opt => opt.value === statusFilter)?.label} Requests`
                        }
                    </h3>
                    <p>
                        {statusFilter === 'ALL'
                            ? "You haven't submitted any adoption requests yet."
                            : `You don't have any ${statusFilter.toLowerCase()} adoption requests.`
                        }
                    </p>
                    {statusFilter !== 'ALL' ? (
                        <button
                            className="btn btn-primary"
                            onClick={() => setStatusFilter('ALL')}
                        >
                            View All Requests
                        </button>
                    ) : (
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/pets')}
                        >
                            Browse Pets
                        </button>
                    )}
                </div>
            ) : (
                <div className="requests-grid">
                    {filteredRequests.map((request) => {
                        const appointment = getAppointmentDetails(request.id);
                        const nextAction = getNextAction(request, appointment);
                        const appointmentInfo = appointment ? {
                            status: appointment.status,
                            appointmentId: appointment.id,
                            visitorName: appointment.visitorName,
                            numberOfVisitors: appointment.numberOfVisitors,
                            appointmentDateTime: appointment.appointmentDateTime
                        } : { status: 'None', appointmentId: null };

                        return (
                            <div
                                key={request.id}
                                className="request-item"
                                ref={el => requestRefs.current[request.id] = el}
                            >
                                <div className="request-header">
                                    <div className="request-title">
                                        <h4>Request ID {request.id}</h4>
                                        <span className="pet-id">Pet ID: {request.petId}</span>
                                    </div>
                                    <span className={`status-badge status-${getStatusBadgeVariant(request.status)}`}>
                                        {request.status}
                                    </span>
                                </div>

                                <div className="request-details">
                                    <div className="detail-group">
                                        <span className="detail-label">Pet ID</span>
                                        <span className="detail-value">{request.petId}</span>
                                    </div>
                                    <div className="detail-group">
                                        <span className="detail-label">Request Date</span>
                                        <span className="detail-value">
                                            {new Date(request.createdAt || new Date()).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="detail-group">
                                        <span className="detail-label">Request Status</span>
                                        <span className={`status-badge status-${getStatusBadgeVariant(request.status)}`}>
                                            {request.status}
                                        </span>
                                    </div>

                                    {appointment && (
                                        <div className="appointment-section">
                                            <h5>Appointment Details</h5>
                                            <div className="appointment-details">
                                                <div className="detail-group">
                                                    <span className="detail-label">Appointment ID</span>
                                                    <span className="detail-value">{appointment.id}</span>
                                                </div>
                                                <div className="detail-group">
                                                    <span className="detail-label">Visitor Name</span>
                                                    <span className="detail-value">{appointment.visitorName}</span>
                                                </div>
                                                <div className="detail-group">
                                                    <span className="detail-label">Number of Visitors</span>
                                                    <span className="detail-value">{appointment.numberOfVisitors}</span>
                                                </div>
                                                <div className="detail-group">
                                                    <span className="detail-label">Appointment Date</span>
                                                    <span className="detail-value">
                                                        {new Date(appointment.appointmentDateTime).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="detail-group">
                                                    <span className="detail-label">Appointment Status</span>
                                                    <span className={`status-badge status-${getStatusBadgeVariant(appointment.status)}`}>
                                                        {appointment.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="request-actions">
                                    {/* Book Appointment Button */}
                                    {canBookAppointment(request, appointment) && (
                                        <div className="action-group">
                                            <button
                                                className="btn btn-success"
                                                onClick={() => handleBookAppointment(request.id)}
                                            >
                                                Book Appointment
                                            </button>
                                            <small className="action-help">
                                                Your request is approved! Book an appointment to visit the pet.
                                            </small>
                                        </div>
                                    )}

                                    {/* View Appointment Button */}
                                    {appointment && (
                                        <div className="action-group">
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleViewAppointment(appointment.id)}
                                            >
                                                View Appointment Details
                                            </button>
                                            <small className="action-help">
                                                Click to see full appointment information
                                            </small>
                                        </div>
                                    )}

                                    {/* Status Messages */}
                                    <div className="status-messages">
                                        {nextAction.type === 'pending' && (
                                            <div className="status-message pending">
                                                {nextAction.message}
                                            </div>
                                        )}
                                        {nextAction.type === 'rejected' && (
                                            <div className="status-message rejected">
                                                {nextAction.message}
                                            </div>
                                        )}
                                        {nextAction.type === 'completed' && (
                                            <div className="status-message completed">
                                                {nextAction.message}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Process Timeline */}
                                <div className="process-timeline">
                                    <div className={`timeline-step ${request.status !== 'PENDING' ? 'completed' : 'active'}`}>
                                        <span className="step-number">1</span>
                                        <span className="step-label">Request Submitted</span>
                                    </div>
                                    <div className={`timeline-step ${['APPROVED', 'IN_PROGRESS', 'COMPLETED'].includes(request.status) ? 'completed' : request.status === 'PENDING' ? 'upcoming' : 'active'}`}>
                                        <span className="step-number">2</span>
                                        <span className="step-label">Request Approved</span>
                                    </div>
                                    <div className={`timeline-step ${appointment ? 'completed' : 'upcoming'}`}>
                                        <span className="step-number">3</span>
                                        <span className="step-label">Appointment Scheduled</span>
                                    </div>
                                    <div className={`timeline-step ${['IN_PROGRESS', 'COMPLETED'].includes(appointment?.status) ? 'completed' : appointment ? 'active' : 'upcoming'}`}>
                                        <span className="step-number">4</span>
                                        <span className="step-label">Visit In Progress</span>
                                    </div>
                                    <div className={`timeline-step ${request.status === 'COMPLETED' ? 'completed' : 'upcoming'}`}>
                                        <span className="step-number">5</span>
                                        <span className="step-label">Adoption Completed</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showBookModal && (
                <BookAppointment
                    adoptionRequestId={selectedRequestId}
                    onClose={() => {
                        setShowBookModal(false);
                        fetchAppointments(); // Refresh appointments after booking
                        fetchRequests(); // Refresh requests to update status
                    }}
                />
            )}
        </div>
    );
};

export default MyRequests;