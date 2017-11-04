ALTER TABLE Notifications CHANGE frequency frequency ENUM('instant','once','6hours','12hours','daily','weekly','ondemand', 'off');
