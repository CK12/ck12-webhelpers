CREATE TABLE Retrolation (
  domainEID varchar(255) NOT NULL,
  sectionEID varchar(255) NOT NULL,
  PRIMARY KEY (domainEID, sectionEID),
  KEY Retrolation_ibfk_1 (domainEID),
  CONSTRAINT Retrolation_ibfk_1 FOREIGN KEY (domainEID) REFERENCES BrowseTerms (encodedID) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
