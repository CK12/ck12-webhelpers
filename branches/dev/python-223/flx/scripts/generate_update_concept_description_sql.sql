select CONCAT("UPDATE BrowseTerms set description='",trim(replace(description, "'", "''")),"' where encodedID = '",trim(encodedID),"';") from BrowseTerms where termTypeID=4 and description is not null and description != 'None' into outfile '/tmp/bt.sql';
select "Wrote to /tmp/bt.sql";
