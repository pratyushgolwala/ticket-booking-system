-- Seed sample data for testing
INSERT INTO shows (name, start_time, total_seats) VALUES
('Rock Concert 2025', '2025-12-25 19:00:00', 10),
('Jazz Night', '2025-12-26 20:00:00', 5);

-- Seed seats for the first show (Rock Concert)
INSERT INTO seats (show_id, seat_no, status) VALUES
(1, '1', 'AVAILABLE'),
(1, '2', 'AVAILABLE'),
(1, '3', 'AVAILABLE'),
(1, '4', 'AVAILABLE'),
(1, '5', 'AVAILABLE'),
(1, '6', 'AVAILABLE'),
(1, '7', 'AVAILABLE'),
(1, '8', 'AVAILABLE'),
(1, '9', 'AVAILABLE'),
(1, '10', 'AVAILABLE');

-- Seed seats for the second show (Jazz Night)
INSERT INTO seats (show_id, seat_no, status) VALUES
(2, '1', 'AVAILABLE'),
(2, '2', 'AVAILABLE'),
(2, '3', 'AVAILABLE'),
(2, '4', 'AVAILABLE'),
(2, '5', 'AVAILABLE');
