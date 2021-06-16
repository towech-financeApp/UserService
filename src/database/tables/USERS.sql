CREATE TABLE Users (
  userID BIGSERIAL NOT NULL PRIMARY KEY,
  name varchar(40) NOT NULL,
  username varchar(255) NOT NULL,
  password varchar(255) NOT NULL,
  role varchar(10) NOT NULL DEFAULT 'user',
  accountConfirmed boolean NOT NULL DEFAULT false,
  refreshTokens varchar(255)[],
  singleSessionToken varchar(255),
  createdAt date NOT NULL DEFAULT NOW()
);