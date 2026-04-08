CREATE DATABASE event_management;
USE event_management;

DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO categories (id, name) VALUES (1,'Workshop'),(2,'Seminar'),(3,'Competition'),(4,'Conference');


DROP TABLE IF EXISTS `users`;
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
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `users` VALUES (1,'akashthuhina@gmail.com','Akash Thuhina','$2a$10$Am0fmWYerBEeKQIAB2Nej.RLiPFwuY4it6kWw17uDG.1I3tT65MmG','organizer','2026-04-08 14:13:35.774831',NULL,'+94781948742'),(2,'sandeepal513@gmail.com','Sandeepa Lakshan','$2a$10$vuC.pb9E9uKtTKf8dikTo.SZJBR1Kr7pnLfP3.d/A./64P0zgLdiC','student','2026-04-08 21:07:50.157433','/defaultAvatart.svg','+94766816272');


DROP TABLE IF EXISTS `societies`;
CREATE TABLE `societies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKrgumhg9lt4fkawfb6spekqpmj` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO societies (id, description, name) VALUES (1,'Technology related activities','IT Society'),(2,'Robotics and AI projects','Robotics Club'),(3,'Sports and fitness','Sports Club');


DROP TABLE IF EXISTS `venues`;
CREATE TABLE `venues` (
  `id` int NOT NULL AUTO_INCREMENT,
  `capacity` int DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO venues (id, capacity, name) VALUES (1,200,'Main Auditorium'),(2,50,'Computer Lab 1'),(3,100,'Conference Hall');

DROP TABLE IF EXISTS `events`;
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    date DATE,
    time TIME,
    ticket_required BOOLEAN,
    tickets_count INT,
    image_url VARCHAR(500),

    category_id INT NOT NULL,
    organizer_id INT NOT NULL,
    venue_id INT NOT NULL,
    society_id INT NOT NULL,

    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT fk_organizer FOREIGN KEY (organizer_id) REFERENCES users(id),
    CONSTRAINT fk_venue FOREIGN KEY (venue_id) REFERENCES venues(id),
    CONSTRAINT fk_society FOREIGN KEY (society_id) REFERENCES societies(id)
);
INSERT INTO events (title, description, date, time, ticket_required, tickets_count, image_url, category_id, organizer_id, venue_id, society_id) VALUES ('React Workshop','Learn modern React development','2026-04-15','10:00:00',TRUE,100,'/images/react.jpg',1,1,2,1),('AI Seminar','Future of Artificial Intelligence','2026-04-20','14:00:00',FALSE,NULL,'/images/ai.jpg',2,1,1,2),('Hackathon 2026','24-hour coding competition','2026-05-01','09:00:00',TRUE,50,'/images/hackathon.jpg',3,1,3,1);


DROP TABLE IF EXISTS `event_approval`;
CREATE TABLE `event_approval` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `event_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK8tvwo9gqf3gcp0xol8pfbii5v` (`event_id`),
  CONSTRAINT `FK8tvwo9gqf3gcp0xol8pfbii5v` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO event_approval (id, created_at, reason, status, event_id) VALUES (1,NOW(),NULL,'APPROVED',1),(2,NOW(),NULL,'APPROVED',2),(3,NOW(),'Need more details','PENDING',3);


DROP TABLE IF EXISTS `registration`;
CREATE TABLE `registration` (
  `id` int NOT NULL AUTO_INCREMENT,
  `register_at` datetime(6) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `event_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKjpuwtlwyad6k20rq163u9wq72` (`event_id`),
  KEY `FKkyuphiynxwt1mtlfsptc991sc` (`user_id`),
  CONSTRAINT `FKjpuwtlwyad6k20rq163u9wq72` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`),
  CONSTRAINT `FKkyuphiynxwt1mtlfsptc991sc` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO registration (id, register_at, status, event_id, user_id) VALUES (1,NOW(),'CONFIRMED',1,2),(2,NOW(),'CONFIRMED',3,2),(3,NOW(),'PENDING',2,2);


DROP TABLE IF EXISTS `tickets`;
CREATE TABLE `tickets` (
  `ticket_id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `qr_code` varchar(256) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `ticket_number` varchar(255) NOT NULL,
  `reg_id` int NOT NULL,
  PRIMARY KEY (`ticket_id`),
  UNIQUE KEY `UK4ks48wgrew48dpkh0wd1rbe2b` (`ticket_number`),
  KEY `FK53skkavmrkrscwkrtm0k9jd8m` (`reg_id`),
  CONSTRAINT `FK53skkavmrkrscwkrtm0k9jd8m` FOREIGN KEY (`reg_id`) REFERENCES `registration` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO tickets (ticket_id, created_at, qr_code, status, ticket_number, reg_id) VALUES (1,NOW(),'QR123ABC','ACTIVE','TICK001',1),(2,NOW(),'QR456DEF','ACTIVE','TICK002',2);


DROP TABLE IF EXISTS `feedbacks`;
CREATE TABLE `feedbacks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `event_id` int NOT NULL,
  `rating` int NOT NULL,
  `comment` varchar(256) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `event_id` (`event_id`),
  CONSTRAINT `feedbacks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `feedbacks_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `feedbacks_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO feedbacks (id, user_id, event_id, rating, comment) VALUES (1,2,1,5,'Great workshop!'),(2,2,2,4,'Very informative'),(3,2,3,5,'Amazing experience');