ALTER TABLE MemberLocations DROP PRIMARY KEY, ADD PRIMARY KEY(memberID, countryID, addressID);
ALTER TABLE MemberLocations DROP INDEX memberID;
