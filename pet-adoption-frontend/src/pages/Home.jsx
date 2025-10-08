// frontend/src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
    const { isAuthenticated, isAdmin, isShelter, isUser } = useAuth();

    // Featured pets data for horizontal scrolling
    const featuredPets = [
        {
            id: 1,
            name: "Max",
            breed: "German Shepherd",
            age: 3,
            location: "Denver, CO",
            image: "https://images.theconversation.com/files/625049/original/file-20241010-15-95v3ha.jpg?ixlib=rb-4.1.0&rect=12%2C96%2C2671%2C1335&q=50&auto=format&w=1336&h=668&fit=crop&dpr=2",
            status: "AVAILABLE"
        },
        {
            id: 2,
            name: "Luna",
            breed: "Golden Retriever",
            age: 2,
            location: "Boulder, CO",
            image: "https://www.petbarn.com.au/petspot/app/uploads/2018/12/Golden-retriever.jpg",
            status: "AVAILABLE"
        },
        {
            id: 3,
            name: "Charlie",
            breed: "Labrador",
            age: 4,
            location: "Colorado Springs, CO",
            image: "https://www.guilfordjamestownvet.com/files/AdobeStock64835449.jpeg",
            status: "AVAILABLE"
        },
        {
            id: 4,
            name: "Buddy",
            breed: "Mixed Breed",
            age: 1,
            location: "Fort Collins, CO",
            image: "https://images.fastcompany.com/image/upload/f_webp,c_fit,w_1920,q_auto/wp-cms/uploads/2014/01/3025003-poster-p-dog-2.jpg",
            status: "AVAILABLE"
        },
        {
            id: 5,
            name: "Bella",
            breed: "Siberian Husky",
            age: 2,
            location: "Aurora, CO",
            image: "https://www.akc.org/wp-content/uploads/2017/11/Siberian-Husky-standing-outdoors-in-the-winter.jpg",
            status: "AVAILABLE"
        },

    ];

    // Feature icons with images
    const features = [
        {
            id: 1,
            title: "Save a Life",
            description: "Give a second chance to homeless pets and make a difference in their lives.",
            image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&h=200&fit=crop&crop=center"
        },
        {
            id: 2,
            title: "Loving Homes",
            description: "Find pets that perfectly match your lifestyle and home environment.",
            image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop&crop=center"
        },
        {
            id: 3,
            title: "Verified Shelters",
            description: "All our partner shelters are verified and maintain high standards of care.",
            image: "https://images.unsplash.com/photo-1560743641-3914f2c45636?w=200&h=200&fit=crop&crop=center"
        }
    ];

    // Create duplicated arrays for seamless looping
    const heroPets = [...featuredPets.slice(0, 4), ...featuredPets.slice(0, 4)]; // Duplicate first 4 pets
    const scrollingPets = [...featuredPets, ...featuredPets]; // Duplicate all pets

    return (
        <div className="home-container">
            {/* Hero Banner */}
            <section className="hero-banner">
                <div className="hero-content">
                    <h1>Where Hearts Meet Paws❤</h1>
                    <p>Give a loving home to pets in need. Browse through our adorable companions waiting for their forever family.</p>
                    <div className="hero-buttons">
                        {!isAuthenticated ? (
                            <>
                                <Link to="/register" className="btn btn-primary">Join Our Community</Link>
                                <Link to="/login" className="btn btn-secondary">Login to Browse Pets</Link>
                            </>
                        ) : (
                            <Link to="/pets" className="btn btn-primary">Browse Pets</Link>
                        )}
                    </div>
                </div>
                <div className="hero-image-scroll">
                    <div className="hero-scroll-track">
                        {heroPets.map((pet, index) => (
                            <div key={`${pet.id}-${index}`} className="hero-scroll-item">
                                <img
                                    src={pet.image}
                                    alt={pet.name}
                                    className="hero-scroll-image"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                    }}
                                />
                                <div className="hero-image-placeholder">
                                    <span>Pet Image</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Pets Horizontal Scrolling Section */}
            <section className="featured-pets-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Available for Adoption</h2>
                        <p>Meet our lovely pets looking for their forever homes</p>
                    </div>

                    <div className="horizontal-scroll-container">
                        <div className="scroll-track">
                            {scrollingPets.map((pet, index) => (
                                <div key={`${pet.id}-${index}`} className="pet-card-large">
                                    <div className="pet-image-wrapper">
                                        <img
                                            src={pet.image}
                                            alt={pet.name}
                                            className="pet-image-large"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                        <div className="image-placeholder-large">
                                            <span>Pet Image</span>
                                        </div>
                                        <div className="pet-overlay">
                                            <div className="pet-info-overlay">
                                                <h3>{pet.name}</h3>
                                                <p>{pet.breed}</p>
                                                <span className="pet-age">{pet.age} years</span>
                                            </div>
                                        </div>
                                        <div className="pet-status-large">{pet.status}</div>
                                    </div>
                                    <div className="pet-details">
                                        <h3>{pet.name}</h3>
                                        <p className="pet-breed">{pet.breed}</p>
                                        <p className="pet-location">{pet.location}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="scroll-indicator">
                        <span>← Scroll to explore more pets →</span>
                    </div>
                </div>
            </section>

            {/* Features Section with Images */}
            <section className="features-section">
                <div className="container">
                    <h2>Why Choose Pet Adoption?</h2>
                    <div className="features-grid">
                        {features.map((feature) => (
                            <div key={feature.id} className="feature-card">
                                <div className="feature-image-container">
                                    <img
                                        src={feature.image}
                                        alt={feature.title}
                                        className="feature-image"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                    <div className="feature-image-placeholder">
                                        <span>Feature Image</span>
                                    </div>
                                </div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Support Section */}
            <section className="contact-support-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Need Help? Contact Us</h2>
                        <p>Our support team is here to help you with any questions</p>
                    </div>
                    <div className="contact-info">
                        <div className="contact-item">
                            <div className="contact-icon">📧</div>
                            <div className="contact-details">
                                <h3>Email Support</h3>
                                <a href="mailto:care4pets@gmail.com">care4pets@gmail.com</a>
                            </div>
                        </div>
                        <div className="contact-item">
                            <div className="contact-icon">📞</div>
                            <div className="contact-details">
                                <h3>Phone Support</h3>
                                <a href="tel:+7989036588">+7 (989) 036-588</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            {isAuthenticated && (
                <section className="stats-section">
                    <div className="container">
                        <div className="stats-grid">
                            <div className="stat-item">
                                <h3>500+</h3>
                                <p>Pets Adopted</p>
                            </div>
                            <div className="stat-item">
                                <h3>50+</h3>
                                <p>Partner Shelters</p>
                            </div>
                            <div className="stat-item">
                                <h3>1000+</h3>
                                <p>Happy Families</p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Role-based Quick Actions with Emojis */}
            {isAuthenticated && (
                <section className="quick-actions">
                    <div className="container">
                        <h2>Quick Actions</h2>
                        <div className="actions-grid">
                            {isUser && (
                                <>
                                    <Link to="/pets" className="action-card">
                                        <div className="action-emoji">🐕</div>
                                        <h3>Adopt a Pet</h3>
                                        <p>Browse available pets for adoption</p>
                                    </Link>
                                    <Link to="/my-requests" className="action-card">
                                        <div className="action-emoji">📋</div>
                                        <h3>My Requests</h3>
                                        <p>View your adoption requests status</p>
                                    </Link>
                                </>
                            )}
                            {isShelter && (
                                <>
                                    <Link to="/add-pet" className="action-card">
                                        <div className="action-emoji">➕</div>
                                        <h3>Add New Pet</h3>
                                        <p>List a new pet for adoption</p>
                                    </Link>
                                    <Link to="/manage-requests" className="action-card">
                                        <div className="action-emoji">📊</div>
                                        <h3>Manage Requests</h3>
                                        <p>Review adoption applications</p>
                                    </Link>
                                </>
                            )}
                            {isAdmin && (
                                <>
                                    <Link to="/admin/dashboard" className="action-card">
                                        <div className="action-emoji">📈</div>
                                        <h3>Dashboard</h3>
                                        <p>View platform statistics</p>
                                    </Link>
                                    <Link to="/admin/reports" className="action-card">
                                        <div className="action-emoji">📄</div>
                                        <h3>Reports</h3>
                                        <p>Generate detailed reports</p>
                                    </Link>
                                    <Link to="/manage-requests" className="action-card">
                                        <div className="action-emoji">📑</div>
                                        <h3>All Requests</h3>
                                        <p>Manage all adoption requests</p>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default Home;