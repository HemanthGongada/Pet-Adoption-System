import React, { useState, useEffect } from 'react';
import { adoptionAPI, appointmentAPI } from '../services/api';
import { toast } from 'react-toastify';
import './ManageRequests.css';

const ManageRequests = () => {
    const [requests, setRequests] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(null);

    // Filter states
    const [filters, setFilters] = useState({
        status: '',
        petId: '',
        userId: '',
        dateFrom: '',
        dateTo: ''
    });
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [isFiltered, setIsFiltered] = useState(false);

    useEffect(() => {
        fetchRequests();
        fetchAppointments();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await adoptionAPI.getAllRequests();
            // Sort requests by newest first
            const sortedRequests = response.data.sort((a, b) =>
                new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id)
            );
            setRequests(sortedRequests);
            setFilteredRequests(sortedRequests);
        } catch (error) {
            toast.error('Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    const fetchAppointments = async () => {
        try {
            const response = await appointmentAPI.getShelterAppointments();
            setAppointments(response.data);
        } catch (error) {
            toast.error('Failed to load appointments');
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = () => {
        if (!hasActiveFilters()) {
            setFilteredRequests(requests);
            setIsFiltered(false);
            toast.info('No filters applied. Showing all requests.');
            return;
        }

        const filtered = requests.filter(request => {
            // Status filter
            if (filters.status && request.status !== filters.status) {
                return false;
            }

            // Pet ID filter
            if (filters.petId && !request.petId.toString().includes(filters.petId)) {
                return false;
            }

            // User ID filter
            if (filters.userId && !request.userId.toString().includes(filters.userId)) {
                return false;
            }

            // Date range filter
            if (filters.dateFrom) {
                const requestDate = new Date(request.createdAt || request.id);
                const fromDate = new Date(filters.dateFrom);
                if (requestDate < fromDate) return false;
            }

            if (filters.dateTo) {
                const requestDate = new Date(request.createdAt || request.id);
                const toDate = new Date(filters.dateTo);
                toDate.setHours(23, 59, 59, 999); // End of the day
                if (requestDate > toDate) return false;
            }

            return true;
        });

        setFilteredRequests(filtered);
        setIsFiltered(true);
        toast.success(`Found ${filtered.length} request(s) matching your filters`);
    };

    const handleResetFilters = () => {
        setFilters({
            status: '',
            petId: '',
            userId: '',
            dateFrom: '',
            dateTo: ''
        });
        setFilteredRequests(requests);
        setIsFiltered(false);
        toast.info('Filters cleared');
    };

    const hasActiveFilters = () => {
        return filters.status || filters.petId || filters.userId || filters.dateFrom || filters.dateTo;
    };

    const handleStatusUpdate = async (id, status) => {
        setUpdatingStatus(id);
        try {
            await adoptionAPI.updateRequestStatus(id, { status });
            toast.success(`Request ${status.toLowerCase()} successfully`);

            // Update local state immediately for better UX
            setRequests(prev => prev.map(req =>
                req.id === id ? { ...req, status } : req
            ));

            setFilteredRequests(prev => prev.map(req =>
                req.id === id ? { ...req, status } : req
            ));

            // Refresh data to ensure consistency
            fetchRequests();
            if (status === 'COMPLETED') {
                fetchAppointments();
            }

        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const handleAppointmentStatusUpdate = async (id, status) => {
        setUpdatingStatus(`appointment-${id}`);
        try {
            await appointmentAPI.updateAppointmentStatus(id, { status });
            toast.success(`Appointment ${status.toLowerCase()} successfully`);

            // Update local state immediately
            setAppointments(prev => prev.map(appt =>
                appt.id === id ? { ...appt, status } : appt
            ));

            // If marking as completed, also update the adoption request status to COMPLETED
            // AND refresh user requests to update adoption button
            if (status === 'COMPLETED') {
                const appointment = appointments.find(appt => appt.id === id);
                if (appointment) {
                    // Update adoption request status to COMPLETED
                    await handleStatusUpdate(appointment.adoptionRequestId, 'COMPLETED');

                    // Refresh both requests and appointments to ensure data consistency
                    fetchRequests();
                    fetchAppointments();

                    toast.info('Adoption process completed! User can now adopt another pet.');
                }
            } else {
                // For other status updates, just refresh appointments
                fetchAppointments();
            }

        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update appointment status');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const getAppointmentDetails = (requestId) => {
        return appointments.find((appt) => appt.adoptionRequestId === requestId);
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

    const canUpdateRequest = (request) => {
        // Can only update PENDING requests
        return request.status === 'PENDING';
    };

    const canUpdateAppointment = (appointment) => {
        if (!appointment) return false;

        // Can update appointments that are not completed or cancelled
        return !['COMPLETED', 'CANCELLED'].includes(appointment.status);
    };

    const getNextAppointmentAction = (appointment) => {
        if (!appointment) return null;

        switch (appointment.status) {
            case 'PENDING':
                return {
                    primary: { label: 'Approve Appointment', status: 'APPROVED', variant: 'success' },
                    secondary: { label: 'Cancel Appointment', status: 'CANCELLED', variant: 'danger' }
                };
            case 'APPROVED':
                return {
                    primary: { label: 'Mark In Progress', status: 'IN_PROGRESS', variant: 'primary' }
                };
            case 'IN_PROGRESS':
                return {
                    primary: { label: 'Mark Completed', status: 'COMPLETED', variant: 'success' }
                };
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="container loading-state">
                <div className="loading-spinner"></div>
                <p>Loading requests...</p>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="page-header">
                <h1>Manage Adoption Requests</h1>
                <div className="header-stats">
                    <span className="stat-badge total">Total: {requests.length}</span>
                    <span className="stat-badge pending">
                        Pending: {requests.filter(r => r.status === 'PENDING').length}
                    </span>
                    <span className="stat-badge completed">
                        Completed: {requests.filter(r => r.status === 'COMPLETED').length}
                    </span>
                    {isFiltered && (
                        <span className="stat-badge filtered">
                            Filtered: {filteredRequests.length}
                        </span>
                    )}
                </div>
            </div>

            {/* Filter Section */}
            <div className="filter-section">
                <div className="filter-header">
                    <h3>Filter Requests</h3>
                    <div className="filter-actions">
                        <button
                            className="btn btn-outline"
                            onClick={handleResetFilters}
                            disabled={!hasActiveFilters()}
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>

                <div className="filter-grid">
                    {/* Status Filter */}
                    <div className="filter-group">
                        <label htmlFor="status">Status</label>
                        <select
                            id="status"
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className="filter-select"
                        >
                            <option value="">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>

                    {/* Pet ID Filter */}
                    <div className="filter-group">
                        <label htmlFor="petId">Pet ID</label>
                        <input
                            type="text"
                            id="petId"
                            name="petId"
                            value={filters.petId}
                            onChange={handleFilterChange}
                            placeholder="Enter Pet ID"
                            className="filter-input"
                        />
                    </div>

                    {/* User ID Filter */}
                    <div className="filter-group">
                        <label htmlFor="userId">User ID</label>
                        <input
                            type="text"
                            id="userId"
                            name="userId"
                            value={filters.userId}
                            onChange={handleFilterChange}
                            placeholder="Enter User ID"
                            className="filter-input"
                        />
                    </div>

                    {/* Date From Filter */}
                    <div className="filter-group">
                        <label htmlFor="dateFrom">From Date</label>
                        <input
                            type="date"
                            id="dateFrom"
                            name="dateFrom"
                            value={filters.dateFrom}
                            onChange={handleFilterChange}
                            className="filter-input"
                        />
                    </div>

                    {/* Date To Filter */}
                    <div className="filter-group">
                        <label htmlFor="dateTo">To Date</label>
                        <input
                            type="date"
                            id="dateTo"
                            name="dateTo"
                            value={filters.dateTo}
                            onChange={handleFilterChange}
                            className="filter-input"
                        />
                    </div>
                </div>

                <div className="search-action">
                    <button
                        className="btn btn-primary search-btn"
                        onClick={handleSearch}
                    >
                        <span className="search-icon"></span>
                        Search Requests
                    </button>
                </div>
            </div>

            {filteredRequests.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>
                        {isFiltered ? 'No Matching Requests' : 'No Adoption Requests'}
                    </h3>
                    <p>
                        {isFiltered
                            ? 'No requests found matching your filter criteria. Try adjusting your filters.'
                            : 'No adoption requests available to manage.'
                        }
                    </p>
                    {isFiltered && (
                        <button
                            className="btn btn-outline"
                            onClick={handleResetFilters}
                        >
                            Show All Requests
                        </button>
                    )}
                </div>
            ) : (
                <div className="requests-grid">
                    {filteredRequests.map((request) => {
                        const appointment = getAppointmentDetails(request.id);
                        const nextAppointmentAction = getNextAppointmentAction(appointment);
                        const isUpdating = updatingStatus === request.id || updatingStatus === `appointment-${appointment?.id}`;

                        return (
                            <div key={request.id} className="request-item">
                                <div className="request-header">
                                    <div className="request-title">
                                        <h4>Request #{request.id}</h4>
                                        <span className="pet-id">Pet ID: {request.petId}</span>
                                    </div>
                                    <span className={`status-badge status-${getStatusBadgeVariant(request.status)}`}>
                                        {request.status}
                                    </span>
                                </div>

                                <div className="request-details">
                                    <div className="detail-group">
                                        <span className="detail-label">User ID</span>
                                        <span className="detail-value">{request.userId}</span>
                                    </div>
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

                                    {appointment ? (
                                        <>
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
                                        </>
                                    ) : (
                                        <div className="no-appointment">
                                            <span className="detail-label">Appointment</span>
                                            <span className="detail-value">No appointment scheduled</span>
                                        </div>
                                    )}
                                </div>

                                <div className="request-actions">
                                    {/* Adoption Request Actions */}
                                    {canUpdateRequest(request) && (
                                        <div className="action-group">
                                            <label>Adoption Request:</label>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn btn-success"
                                                    onClick={() => handleStatusUpdate(request.id, 'APPROVED')}
                                                    disabled={isUpdating}
                                                >
                                                    {updatingStatus === request.id ? 'Approving...' : 'Approve Request'}
                                                </button>
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() => handleStatusUpdate(request.id, 'REJECTED')}
                                                    disabled={isUpdating}
                                                >
                                                    {updatingStatus === request.id ? 'Rejecting...' : 'Reject Request'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Appointment Actions */}
                                    {canUpdateAppointment(appointment) && nextAppointmentAction && (
                                        <div className="action-group">
                                            <label>Appointment:</label>
                                            <div className="action-buttons">
                                                <button
                                                    className={`btn btn-${nextAppointmentAction.primary.variant}`}
                                                    onClick={() => handleAppointmentStatusUpdate(appointment.id, nextAppointmentAction.primary.status)}
                                                    disabled={isUpdating}
                                                >
                                                    {isUpdating ? 'Updating...' : nextAppointmentAction.primary.label}
                                                </button>
                                                {nextAppointmentAction.secondary && (
                                                    <button
                                                        className={`btn btn-${nextAppointmentAction.secondary.variant}`}
                                                        onClick={() => handleAppointmentStatusUpdate(appointment.id, nextAppointmentAction.secondary.status)}
                                                        disabled={isUpdating}
                                                    >
                                                        {nextAppointmentAction.secondary.label}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Status indicators - simplified */}
                                    {request.status === 'COMPLETED' && (
                                        <div className="status-indicator completed">
                                            <span className="status-icon">✓</span>
                                            <span>Adoption completed</span>
                                        </div>
                                    )}

                                    {['REJECTED', 'CANCELLED'].includes(request.status) && (
                                        <div className="status-indicator rejected">
                                            <span className="status-icon">✗</span>
                                            <span>Process {request.status.toLowerCase()}</span>
                                        </div>
                                    )}
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
        </div>
    );
};

export default ManageRequests;