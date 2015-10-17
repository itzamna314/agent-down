drop schema if exists `agent`;

CREATE SCHEMA if not exists `agent` ;

use `agent`;

create table if not exists location(
	id int primary key not null auto_increment,
    name nvarchar(255) not null,
    imagePath nvarchar(255) null,
    createdOn datetime not null default CURRENT_TIMESTAMP,
    createdBy nvarchar(255) not null,
    modifiedOn datetime null,
    modifiedBy nvarchar(255) null
);

create table if not exists game(
	id int primary key not null auto_increment,
    locationId int null, FOREIGN KEY (locationId) references location (id),
    state nvarchar(255) not null default 'created',
    secondsRemaining int not null default 480,
    latitude decimal(16,12) null,
    longitude decimal(16,12) null,
    createdOn datetime not null default CURRENT_TIMESTAMP,
    createdBy nvarchar(255) not null,
    modifiedOn datetime null,
    modifiedBy nvarchar(255) null
);


create table if not exists player(
	id int primary key not null auto_increment,
    name nvarchar(1024) not null,
    gameId int null, FOREIGN KEY (gameId) references game (id),
    isSpy boolean null,
    isCreator boolean null,
    hasAccused boolean null,
    createdOn datetime not null default CURRENT_TIMESTAMP,
    createdBy nvarchar(255) not null,
    modifiedOn datetime null,
    modifiedBy nvarchar(255) null
);

create table if not exists accusation(
	id int primary key not null auto_increment,
    accuserId int not null, FOREIGN KEY (accuserId) references player (id),
    accusedId int not null, FOREIGN KEY (accusedId) references player (id),
    gameId int not null, FOREIGN KEY (gameId) references game (id),
    votesFor int not null default 0,
    votesAgainst int not null default 0,
    state nvarchar(255) not null default 'voting',
	createdOn datetime not null default CURRENT_TIMESTAMP,
    createdBy nvarchar(255) not null,
    modifiedOn datetime null,
    modifiedBy nvarchar(255) null
);

create table if not exists playerAccusation(
	id int primary key not null auto_increment,
    playerId int not null, FOREIGN KEY (playerId) references player (id),
    accusationId int not null, FOREIGN KEY (playerId) references accusation (id),
    accuse boolean not null,
    createdOn datetime not null default CURRENT_TIMESTAMP,
    createdBy nvarchar(255) not null,
    modifiedOn datetime null,
    modifiedBy nvarchar(255) null
);

insert into location (name, imagePath, createdOn, createdBy) values
	('beach', 'http://freedesignfile.com/upload/2013/08/Cartoon-Tropical-Beach-vector-02.jpg', CURRENT_TIMESTAMP, 'seedData')
  , ('moon', 'http://www.webweaver.nu/clipart/img/nature/planets/cartoon-moon.png', CURRENT_TIMESTAMP, 'seedData')
    

