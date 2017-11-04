ALTER TABLE `UnderageEmailTokens` DROP PRIMARY KEY, MODIFY `token` varchar(511), ADD PRIMARY KEY (`parentEmail`(63), `token`(255));
