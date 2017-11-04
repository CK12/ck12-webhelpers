update Resources set name = REPLACE(name, '+', ' ') where resourceTypeID = 17 and ownerID = 3;
update Resources set name = REPLACE(name, '_', ' ') where resourceTypeID = 16 and ownerID = 3;
