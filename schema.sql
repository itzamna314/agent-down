drop schema if exists `agent`;

CREATE SCHEMA if not exists `agent` ;

use `agent`;

create table if not exists player(
	id int primary key not null auto_increment,
    name nvarchar(1024) not null,
    gameId int null,
    isSpy boolean null,
	isBeingAccused boolean null,
    isCreator boolean null,
    hasAccused boolean null,
    createdOn datetime not null default CURRENT_TIMESTAMP,
    createdBy nvarchar(255) not null,
    modifiedOn datetime null,
    modifiedBy nvarchar(255) null
);

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
    creatorId int null, FOREIGN KEY (creatorId) references player(id),
    spyId int null, foreign key (spyId) references player(id),
    accusedId int null, foreign key (accusedId) references player(id),
    accuserId int null, foreign key (accuserId) references player(id),
    state nvarchar(255) not null default 'created',
    secondsRemaining int not null default 480,
    latitude decimal null,
    longitude decimal null,
    createdOn datetime not null default CURRENT_TIMESTAMP,
    createdBy nvarchar(255) not null,
    modifiedOn datetime null,
    modifiedBy nvarchar(255) null
);

alter table player
add constraint foreign key (gameId) references game (id);
    

