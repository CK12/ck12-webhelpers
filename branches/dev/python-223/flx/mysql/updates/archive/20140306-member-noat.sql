UPDATE Members SET givenName=REPLACE(givenName, '@', ' '), surname=REPLACE(surname, '@', ' ') where givenName like '%@%' or surname like '%@%';
