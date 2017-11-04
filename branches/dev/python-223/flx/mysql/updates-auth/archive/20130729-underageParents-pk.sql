ALTER TABLE UnderageMemberParents DROP COLUMN id;
ALTER TABLE UnderageMemberParents ADD PRIMARY KEY(memberID, parentEmail);
