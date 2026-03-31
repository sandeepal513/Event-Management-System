-- DATABASE
CREATE DATABASE event_management;
USE event_management;

-- 1. USERS
CREATE TABLE users (
    id INT(4) NOT NULL AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(256) NOT NULL,
    role ENUM('admin', 'organizer', 'student') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- 2. CATEGORIES
CREATE TABLE categories (
    id INT(4) NOT NULL AUTO_INCREMENT,
    name VARCHAR(20) NOT NULL,
    PRIMARY KEY (id)
);

-- 3. ORGANIZERS
CREATE TABLE societies (
    id INT(4) NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(256),
    PRIMARY KEY (id)
);

-- 4. EVENTS
CREATE TABLE events (
    id INT(4) NOT NULL AUTO_INCREMENT,
    title VARCHAR(50) NOT NULL,
    description VARCHAR(256),
    date DATE NOT NULL,
    society_id INT(4) NOT NULL,
    venue_id INT(4) NOT NULL,
    category_id INT(4) NOT NULL,
    organizer_id INT(4) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE,
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. VENUES
CREATE TABLE venues (
    id INT(4) NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    capacity INT(4) NOT NULL,
    PRIMARY KEY (id)

-- 6. REGISTRATION
CREATE TABLE registration (
    id INT(4) NOT NULL AUTO_INCREMENT,
    user_id INT(4) NOT NULL,
    event_id INT(4) NOT NULL,
    status ENUM('pending', 'approve', 'cancel') DEFAULT 'pending',
    register_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- 7. TICKETS
CREATE TABLE tickets (
    id INT(4) NOT NULL AUTO_INCREMENT,
    registration_id INT(4) NOT NULL,
    ticket_number VARCHAR(10) NOT NULL,
    qr_code VARCHAR(256),
    PRIMARY KEY (id),
    FOREIGN KEY (registration_id) REFERENCES registration(id) ON DELETE CASCADE
);

-- 8. FEEDBACKS
CREATE TABLE feedbacks (
    id INT(4) NOT NULL AUTO_INCREMENT,
    user_id INT(4) NOT NULL,
    event_id INT(4) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment VARCHAR(256),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);