UPDATE `Resources` SET `satelliteUrl` = REPLACE(`satelliteUrl`, 'https://image-dev.ck12.org.s3-website-us-east-1.amazonaws.com/', 'https://s3.amazonaws.com/image-dev.ck12.org/') WHERE satelliteUrl LIKE 'https://image-dev.ck12.org.s3-website-us-east-1.amazonaws.com/%';
