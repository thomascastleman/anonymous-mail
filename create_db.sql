
DROP DATABASE IF EXISTS anonymousmail;
CREATE DATABASE anonymousmail;

USE anonymousmail;

-- administrator account data
CREATE TABLE administrators (
	uid INT NOT NULL AUTO_INCREMENT,
	email VARCHAR(45),
	full_name VARCHAR(32),
	PRIMARY KEY (uid)
);

-- all letters awaiting responses
CREATE TABLE waiting_letters (
	uid INT NOT NULL AUTO_INCREMENT,
	content TEXT,
	sender_email VARCHAR(45),
	time_received DATETIME,
	draft_started TINYINT(1) DEFAULT 0,
	PRIMARY KEY (uid)
);

-- all saved drafts of responses not yet sent
CREATE TABLE drafts (
	uid INT NOT NULL AUTO_INCREMENT,
	content TEXT,
	letter_uid INT,
	FOREIGN KEY (letter_uid) REFERENCES waiting_letters(uid),
	PRIMARY KEY (uid)
);

-- test data
INSERT INTO administrators (email, full_name) VALUES ("testemail@gmail.com", "Test Admin");
INSERT INTO waiting_letters(content, sender_email, time_received) VALUES ("This is a letter than is awaiting a response.", "sender@gmail.com", NOW());
INSERT INTO drafts (content, letter_uid) VALUES ("Content in draft.", 1);