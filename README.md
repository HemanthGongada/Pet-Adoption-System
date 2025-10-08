Care4Pets: Full-Stack Pet Adoption Platform 🐕‍🦺


This is a comprehensive, full-stack application designed to connect users with animal shelters to facilitate the pet adoption process. 
The platform features a secure, multi-role system, a robust adoption workflow, and a user-friendly interface.

.

🌟 Key Features

Multi-Role System: Secure role-based access control for Users, Shelters, and Admins
Secure Authentication: Utilizes JWT (JSON Web Tokens) and Spring Security for stateless, secure API communication. Passwords are secured using BCryptPasswordEncoder.
Adoption Workflow: A structured process covering:
Submitting adoption requests.
Scheduling and managing appointments for pet visits.
Tracking request status: PENDING, APPROVED, REJECTED, COMPLETED.
Pet Management: Shelters and Admins can add, update, and delete pet listings.
Admin Dashboard: Dedicated sections for system administration, reports, and request management.


🛠️ Tech Stack

💻 Frontend (Client)

Technology	                               Description

React	                     The core JavaScript library for building the user interface.

Vite                       Next-generation frontend tooling for fast development.

React Router	             Declarative routing for navigation.

Custom Auth Context	       Global state management for user authentication and roles.

Modern CSS	              Custom styling with responsive design.
  

⚙️ Backend (API)

 Technology                             	Description

 Spring Boot	                  The primary framework for building the RESTful API.

 Spring Security	              Handles all security features, including JWT validation and authorization

 Database	                      Uses MySQL for data persistence (Requires appropriate configuration)

 JPA/Hibernate                	Object-Relational Mapping for database interactions

 🚀 Getting Started
 Prerequisites
 
You need the following software installed on your machine:

Java Development Kit (JDK) 17+

Node.js (LTS recommended) and npm or yarn

MySQL Server

Git

1. Backend Setup (Spring Boot API)
  1.Clone the Repository: git clone : github.com/HemanthGongada/Pet-Adoption-System
                        cd C:\Users\HEMANTH\Desktop\Pet Adoption\pet-adoption-backend
   
  2.Database Configuration:  Create a MySQL database (e.g., pet_adoption_db).
                             Update the application.properties (or application.yml) file with your database credentials and connection details.
                             You will also need to configure your JWT Secret Key in the configuration file

  3.Run the Application:     ./mvnw spring-boot:run
                             # The API should start on http://localhost:8080 (or specified port)

  (Note: Based on CORS configuration, the API is expected to run on port 8080 and the frontend on port 3000).

 2. Frontend Setup(React App)

    1. Navigate to the Frontend Directory: cd C:\Users\HEMANTH\Desktop\Pet Adoption\pet-adoption-frontend
    2. Install Dependencies: npm install # or yarn install
    3. Run the Application: npm run dev # or yarn dev
                            # The React application should open in your browser on http://localhost:3000

 🔑 Authentication and Roles

 The application uses specific roles to control access to different features:

 Role                               Key Permissions

 ROLE_USER	                        Browse pets, submit adoption requests, create appointments, view personal requests/profile.

 ROLE_SHELTER	                      Add, update, and delete pets, manage all adoption requests, manage appointments.
 
 ROLE_ADMIN	                        Full access, including pet management, adoption request management, and access to admin dashboard/reports.


 






	

       
       









                           











 
 

