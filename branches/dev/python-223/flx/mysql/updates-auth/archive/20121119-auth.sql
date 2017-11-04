ALTER TABLE `MemberRoles`
    DROP PRIMARY KEY,
    ADD PRIMARY KEY (`id`),
    DROP FOREIGN KEY `MemberRoles_ibfk_1`,
    DROP COLUMN `groupID`;

INSERT INTO `MemberRoles` (`id`, `name`, `description`) VALUES
    (16, 'mentor', 'Student Mentor'),
    (17, 'representative', 'School Representative');
