import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { appointmentAPI, userAPI } from '../services/api';
import './BookAppointment.css';

const BookAppointment = ({ adoptionRequestId, onClose }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        visitorName: '',
        numberOfVisitors: 1,
        shelterId: '',
        appointmentDateTime: '',
    });
    const [shelters, setShelters] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchShelters();
    }, []);

    const fetchShelters = async () => {
        try {
            const response = await userAPI.getShelters();
            setShelters(response.data);
        } catch (error) {
            toast.error('Failed to load shelters');
        }
    };

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
            await appointmentAPI.createAppointment({
                ...formData,
                adoptionRequestId,
                appointmentDateTime: new Date(formData.appointmentDateTime).toISOString(),
            });
            toast.success('Appointment booked successfully!');
            onClose();
            navigate('/my-requests');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to book appointment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Book Appointment</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Visitor Name</label>
                        <input
                            type="text"
                            name="visitorName"
                            value={formData.visitorName}
                            onChange={handleChange}
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Number of Visitors</label>
                        <input
                            type="number"
                            name="numberOfVisitors"
                            value={formData.numberOfVisitors}
                            onChange={handleChange}
                            className="form-control"
                            min="1"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Shelter Location</label>
                        <select
                            name="shelterId"
                            value={formData.shelterId}
                            onChange={handleChange}
                            className="form-control"
                            required
                        >
                            <option value="">Select a shelter</option>
                            {shelters.map((shelter) => (
                                <option key={shelter.id} value={shelter.id}>
                                    {shelter.name} - {shelter.city}, {shelter.state}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Date and Time</label>
                        <input
                            type="datetime-local"
                            name="appointmentDateTime"
                            value={formData.appointmentDateTime}
                            onChange={handleChange}
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit" disabled={loading} className="btn btn-primary">
                            {loading ? 'Booking...' : 'Book Appointment'}
                        </button>
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookAppointment;