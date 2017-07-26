# Spies

List of characters with attributes:

List of characters with attributes:

SPY: Ability to kill

BODYGUARD: Can protect one person a night

HACKER: See the character of one person per night

BURGLAR(need better name): Can swap identity with someone

DEAD MANS HAND: Can choose to kill someone once they are killed

MATCHMAKER: Can make tow people fall in love once a game.  If one lover is killed,
  the other one dies too.


FIREBASE DATABASE DOCS:
    hostuid: user id of the room's creator

    players: list of all players by their user id's

    dayKillVote: the uid of the player the player that is being
      referenced voted to kill. "none" means they have not voted.

    isAlive: True if alive, false if dead

    isHost: true if referenced player created the referenced room

    name: chosen alias, just their email if they don't choose

    role: the character they play in the game. eg hacker, spy ...

    uid: their user id.  Needed because we can't reference parent
      nodes in the database

    roomName: Rooms name. Needed for the same reason as above

    state: ongoing if a game is in progress and waiting if the game is
      created but the host still needs to start it.  If you get a null value
      for this, use the REST API instead of the firebase listener
