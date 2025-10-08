import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
};

export const petAPI = {
    getAllPets: () => api.get('/pets'),
    getPetById: (id) => api.get(`/pets/${id}`),
    addPet: (petData) => {
        const formData = new FormData();
        formData.append('name', petData.name);
        formData.append('type', petData.type);
        formData.append('age', petData.age);
        formData.append('breed', petData.breed);
        formData.append('description', petData.description);
        formData.append('status', petData.status);
        if (petData.photo) {
            formData.append('photo', petData.photo);
        }
        return api.post('/pets/add', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    updatePet: (id, petData) => {
        const formData = new FormData();
        const petJson = JSON.stringify({
            name: petData.name,
            type: petData.type,
            age: petData.age,
            breed: petData.breed,
            description: petData.description,
            status: petData.status
        });
        formData.append('pet', new Blob([petJson], { type: 'application/json' }));
        if (petData.photo && typeof petData.photo !== 'string') {
            formData.append('photo', petData.photo);
        }
        return api.put(`/pets/update/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    deletePet: (id) => api.delete(`/pets/delete/${id}`),
};

// In services/api.js - make sure these endpoints exist
export const adminAPI = {
    getDashboard: () => api.get('/admin/dashboard'),
    getAdoptionReports: (params) => api.get('/admin/reports/adoptions', { params }),
    getUserReports: () => api.get('/admin/reports/users'),
    getPetReports: () => api.get('/admin/reports/pets'),
    getPlatformAnalytics: () => api.get('/admin/reports/analytics')
};

export const adoptionAPI = {
    createRequest: (data) => api.post('/adoptions/create', data),
    getUserRequests: () => api.get('/adoptions/user'),
    getAllRequests: () => api.get('/adoptions/manage/all'),
    updateRequestStatus: (id, data) => api.put(`/adoptions/manage/${id}`, data)
};

export const appointmentAPI = {
    createAppointment: (data) => api.post('/appointments/create', data),
    getUserAppointments: () => api.get('/appointments/user'),
    getShelterAppointments: () => api.get('/appointments/shelter'),
    updateAppointmentStatus: (id, data) => api.put(`/appointments/manage/${id}`, data)
};

export const userAPI = {
    getProfile: () => api.get('/user/profile'),
    updateProfile: (userData) => api.put('/user/profile', userData),
    changePassword: (data) => api.put('/user/change-password', data),
    getShelters: () => api.get('/user/shelters')
};

export default api;