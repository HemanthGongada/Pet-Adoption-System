//frontend/src/pages/AddPet.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { petAPI } from '../services/api';

const AddPet = () => {
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
    const navigate = useNavigate();

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
            await petAPI.addPet({ ...formData, photo });
            toast.success('Pet added successfully!');
            navigate('/pets');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add pet');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="form-container">
                <h2>Add New Pet</h2>
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
                        <label>Photo</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="form-control"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="form-control ">
                        {loading ? 'Adding Pet...' : 'Add Pet'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddPet;
