
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
	FOREIGN KEY (letter_uid) REFERENCES waiting_letters(uid) ON DELETE CASCADE,
	PRIMARY KEY (uid)
);