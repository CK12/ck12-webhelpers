UPDATE `DomainUrls` SET `url` = REPLACE(`url`, 'http://concepts.ck12.org/', 'https://s3.amazonaws.com/concepts.ck12.org/') WHERE `url` LIKE 'http://concepts.ck12.org/%';
