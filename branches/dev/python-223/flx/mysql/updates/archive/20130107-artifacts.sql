alter table Artifacts add messageToUsers varchar(1024) DEFAULT NULL comment 'This brief message will appear on the first page or screen below the title, to explain important facts about the resource or version' after description;
