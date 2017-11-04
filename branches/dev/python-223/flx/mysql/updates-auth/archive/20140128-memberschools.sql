ALTER TABLE MemberSchools
    DROP COLUMN fromMaster,
    ADD COLUMN schoolType enum('usmaster', 'other', 'home')  NOT NULL DEFAULT 'usmaster';
