create table notifications (
	notificationId nvarchar(75) PRIMARY KEY NOT NULL,
	eventDate datetime,
	publishDate datetime,
	eventDate_orig nvarchar(30),
	publishDate_orig nvarchar(30),
	publishAttemptCount int,
	username nvarchar(MAX),
	userId nvarchar(MAX),
	eiasToken nvarchar(MAX)
);