import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { petAPI } from '../services/api';

const EditPet = () => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'DOG',
        age: '',
        breed: '',
        description: '',
        status: 'AVAILABLE',
    });
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        fetchPet();
    }, [id]);

    const fetchPet = async () => {
        try {
            const response = await petAPI.getPetById(id);
            const petData = response.data;
            setFormData({
                name: petData.name,
                type: petData.type,
                age: petData.age,
                breed: petData.breed,
                description: petData.description,
                status: petData.status,
            });
        } catch (error) {
            console.error('Error fetching pet:', error);
            toast.error('Failed to load pet details');
            navigate('/pets');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handlePhotoChange = (e) => {
        setPhoto(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await petAPI.updatePet(id, { ...formData, photo });
            toast.success('Pet updated successfully!');
            navigate('/pets');
        } catch (error) {
            console.error('Update error:', error);
            toast.error(error.response?.data?.message || 'Failed to update pet');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return <div className="container">Loading pet details...</div>;
    }

    return (
        <div className="container">
            <div className="form-container">
                <h2>Edit Pet Details</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label>Type</label>
                        <select name="type" value={formData.type} onChange={handleChange}
                        className="form-control">

                            <option value="DOG">Dog</option>
                            <option value="CAT">Cat</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Age</label>
                        <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            required
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label>Breed</label>
                        <input
                            type="text"
                            name="breed"
                            value={formData.breed}
                            onChange={handleChange}
                            required
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label>Status</label>
                        <select name="status" value={formData.status} onChange={handleChange}
                        className="form-control">
                            <option value="AVAILABLE">Available</option>
                            <option value="ADOPTED">Adopted</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Update Photo</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="form-control"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="form-control btn-primary">
                        {loading ? 'Updating Pet...' : 'Update Pet'}
                    </button>

                    <button
                        type="button"
                        className="form-control btn-secondary"
                        onClick={() => navigate('/pets')}
                        style={{marginLeft: '10px'}}
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditPet;