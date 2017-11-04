CREATE TABLE USSchoolsMaster (
    id int(11) NOT NULL AUTO_INCREMENT,
    name varchar(128),
    nces_id varchar(24) DEFAULT NULL,
    address varchar(128) DEFAULT NULL,
    city varchar(64) DEFAULT NULL,
    state varchar(2) DEFAULT NULL,
    zipcode varchar(5) DEFAULT NULL,
    county varchar(56) DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE INDEX (name, nces_id, address, city, state, zipcode, county)
) DEFAULT charset=utf8;
