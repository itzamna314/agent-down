create table if not exists location(
	id int primary key not null,
    name nvarchar(255) not null,
    imagePath nvarchar(255) null,
    createdOn datetime not null default CURRENT_TIMESTAMP,
    createdBy nvarchar(255) not null,
    modifiedOn datetime null,
    modifiedBy nvarchar(255) null
);

create table if not exists game(
	id int primary key not null,
    locationId int null, FOREIGN KEY (locationId) references location (id),
    state nvarchar(255) not null default 'created',
    secondsRemaining int not null default 480,
    latitude decimal null,
    longitude decimal null,
    createdOn datetime not null default CURRENT_TIMESTAMP,
    createdBy nvarchar(255) not null,
    modifiedOn datetime null,
    modifiedBy nvarchar(255) null
);
    

create table if not exists player(
	id int primary key not null,
    name nvarchar(1024) not null,
    gameId int not null, FOREIGN KEY (gameId) references game (id),
    isSpy bit null,
	isBeingAccused bit null,
    isCreator bit null,
    hasAccused bit null,
    createdOn datetime not null default CURRENT_TIMESTAMP,
    createdBy nvarchar(255) not null,
    modifiedOn datetime null,
    modifiedBy nvarchar(255) null
)