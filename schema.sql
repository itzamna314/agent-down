drop schema if exists `agent`;

CREATE SCHEMA if not exists `agent` ;

use `agent`;

create table if not exists gameStateType(
	id int primary key not null auto_increment,
    name nvarchar(32) not null
);

insert into gameStateType(name) values
	('awaitingPlayers'),
    ('inProgress'),
    ('voting'),
    ('timeExpired'),
    ('finalReckoning'),
	('spyWins'),
    ('playersWin');

create table if not exists accusationStateType(
	id int primary key not null auto_increment,
    name nvarchar(32) not null
);

insert into accusationStateType(name) values
	('voting'),
    ('innocent'),
    ('guilty');
    
create table if not exists victoryType (
	id int primary key not null auto_increment,
    name nvarchar(32) not null
);

insert into victoryType(name) values
	('guess'),
    ('accuse'),
    ('default');


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
    locationGuessId int null, FOREIGN KEY (locationGuessId) references location (id),
    stateId int not null default 1, FOREIGN KEY (stateId) references gameStateType (id),
    victoryTypeId int null, FOREIGN KEY (victoryTypeId) references victoryType(id),
    latitude decimal(16,12) null,
    longitude decimal(16,12) null,
    secondsRemaining int not null default 480,
    clockStartTime datetime not null default CURRENT_TIMESTAMP,
    clockIsRunning boolean not null default false,
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
    time int not null,
    stateId int not null default 1, FOREIGN KEY (stateId) references accusationStateType (id),
    gameStateId int not null default 3, FOREIGN KEY (gameStateId) references gameStateType (id),
	createdOn datetime not null default CURRENT_TIMESTAMP,
    createdBy nvarchar(255) not null,
    modifiedOn datetime null,
    modifiedBy nvarchar(255) null
);

create unique index uq_accusation on accusation(accuserId, accusedId, gameId, gameStateId);

create table if not exists playerAccusation(
	id int primary key not null auto_increment,
    playerId int not null, FOREIGN KEY (playerId) references player (id),
    accusationId int not null, FOREIGN KEY (accusationId) references accusation (id),
    accuse boolean not null,
    createdOn datetime not null default CURRENT_TIMESTAMP,
    createdBy nvarchar(255) not null,
    modifiedOn datetime null,
    modifiedBy nvarchar(255) null
);

create unique index uq_playerAccusation on playerAccusation(playerId, accusationId);

insert into location (name, imagePath, createdOn, createdBy) values
	('beach', 'http://freedesignfile.com/upload/2013/08/Cartoon-Tropical-Beach-vector-02.jpg', CURRENT_TIMESTAMP, 'seedData')
  , ('moon', 'http://www.webweaver.nu/clipart/img/nature/planets/cartoon-moon.png', CURRENT_TIMESTAMP, 'seedData')
    

