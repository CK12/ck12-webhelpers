ALTER TABLE Contents DROP FOREIGN KEY Contents_ibfk_1;
DELETE FROM Contents WHERE (resourceURI, ownerID) NOT IN ( SELECT uri, ownerID FROM Resources );
ALTER TABLE Contents ADD FOREIGN KEY Contents_ibfk_1 (resourceURI, ownerID) REFERENCES Resources(uri, ownerID) ON DELETE NO ACTION ON UPDATE NO ACTION;
