-- Disable checks (optional but safe during setup)
SET FOREIGN_KEY_CHECKS = 0;

-- =========================
-- 1. BASE TABLES
-- =========================

CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('admin','organizer','student') DEFAULT NULL,
  `create_at` datetime(6) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `phone_no` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`)
);

CREATE TABLE `societies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`name`)
);

CREATE TABLE `venues` (
  `id` int NOT NULL AUTO_INCREMENT,
  `capacity` int DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- =========================
-- 2. EVENTS
-- =========================

CREATE TABLE `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `time` time DEFAULT NULL,
  `ticket_required` tinyint(1) DEFAULT NULL,
  `tickets_count` int DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `category_id` int NOT NULL,
  `organizer_id` int NOT NULL,
  `venue_id` int NOT NULL,
  `society_id` int NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_organizer` FOREIGN KEY (`organizer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_society` FOREIGN KEY (`society_id`) REFERENCES `societies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_venue` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE CASCADE
);

-- =========================
-- 3. CHILD TABLES
-- =========================

CREATE TABLE `event_approval` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `event_id` int NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_event_approval_event`
    FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
);

CREATE TABLE `feedbacks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `event_id` int NOT NULL,
  `rating` int NOT NULL,
  `comment` varchar(256) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_feedback_event`
    FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_feedback_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `feedbacks_chk_1` CHECK (`rating` BETWEEN 1 AND 5)
);

CREATE TABLE `registration` (
  `id` int NOT NULL AUTO_INCREMENT,
  `register_at` datetime(6) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `event_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `FK_registration_event`
    FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_registration_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- =========================
-- 4. FINAL CHILD
-- =========================

CREATE TABLE `tickets` (
  `ticket_id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `qr_code` varchar(256) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `ticket_number` varchar(255) NOT NULL,
  `reg_id` int NOT NULL,
  PRIMARY KEY (`ticket_id`),
  UNIQUE KEY (`ticket_number`),
  CONSTRAINT `fk_ticket_registration`
    FOREIGN KEY (`reg_id`) REFERENCES `registration` (`id`) ON DELETE CASCADE
);

-- =========================
-- INSERT DATA (CORRECT ORDER)
-- =========================

INSERT INTO categories VALUES
(1,'Workshop'),(2,'Seminar'),(3,'Competition'),(4,'Conference');

INSERT INTO users VALUES
(1,'akashthuhina@gmail.com','Akash Thuhina','pass','organizer','2026-04-08',NULL,'+94781948742'),
(2,'sandeepal513@gmail.com','Sandeepa Lakshan','pass','student','2026-04-08',NULL,'+94766816272');

INSERT INTO societies VALUES
(1,'Technology related activities','IT Society'),
(2,'Robotics and AI projects','Robotics Club'),
(3,'Sports and fitness','Sports Club');

INSERT INTO venues VALUES
(1,200,'Main Auditorium'),
(2,50,'Computer Lab 1'),
(3,100,'Conference Hall');

INSERT INTO events VALUES
(1,'React Workshop','Learn modern React','2026-04-15','10:00:00',1,100,'/img',1,1,2,1),
(2,'AI Seminar','Future AI','2026-04-20','14:00:00',0,NULL,'/img',2,1,1,2),
(3,'Hackathon','Coding','2026-05-01','09:00:00',1,50,'/img',3,1,3,1);

INSERT INTO event_approval VALUES
(1,NOW(),NULL,'APPROVED',1),
(2,NOW(),NULL,'APPROVED',2),
(3,NOW(),'Need more details','PENDING',3);

INSERT INTO feedbacks VALUES
(1,2,1,5,'Great!',NOW()),
(2,2,2,4,'Good',NOW());

INSERT INTO registration VALUES
(1,NOW(),'CONFIRMED',1,2),
(2,NOW(),'CONFIRMED',3,2);

INSERT INTO tickets VALUES
(1,NOW(),'QR123','ACTIVE','TICK001',1),
(2,NOW(),'QR456','ACTIVE','TICK002',2);

-- Enable checks again
SET FOREIGN_KEY_CHECKS = 1;