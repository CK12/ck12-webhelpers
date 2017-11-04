ALTER TABLE From1xBookMembers CHANGE declined status ENUM('Not Started', 'In Progress', 'Done', 'Acknowledged', 'Failed', 'Declined') DEFAULT 'Not Started';
UPDATE From1xBookMembers SET status='Not Started' WHERE status IS NULL;
