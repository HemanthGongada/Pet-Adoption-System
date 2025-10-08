import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import AddPet from './pages/AddPet';
import Pets from './pages/Pets';
import './App.css';
import AdminDashboard from './pages/AdminDashboard';
import AdminReports from './pages/AdminReports';
import ManageRequests from './pages/ManageRequests';
import MyRequests from './pages/MyRequests';
import Profile from './pages/Profile';
import EditPet from './pages/EditPet';
import PetDetails from './pages/PetDetails';
import BookAppointment from './pages/BookAppointment';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Navbar />
                    <main>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/pets" element={<Pets />} />
                            <Route
                                path="/add-pet"
                                element={
                                    <ProtectedRoute>
                                        <AddPet />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <AdminDashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/reports"
                                element={
                                    <ProtectedRoute>
                                        <AdminReports />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute>
                                        <Profile />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/manage-requests"
                                element={
                                    <ProtectedRoute>
                                        <ManageRequests />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/my-requests"
                                element={
                                    <ProtectedRoute>
                                        <MyRequests />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/edit-pet/:id"
                                element={
                                    <ProtectedRoute>
                                        <EditPet />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="/pet-details/:id" element={<PetDetails />} />
                            <Route
                                path="/book-appointment/:id"
                                element={
                                    <ProtectedRoute>
                                        <BookAppointment />
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </main>
                    <ToastContainer position="bottom-right" />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;