import sqlite3

# Nome del file del database
db_filename = 'theaters.db'

# Connessione al database (crea il file se non esiste)
conn = sqlite3.connect(db_filename)
cursor = conn.cursor()

# Inizio della transazione
cursor.execute('BEGIN TRANSACTION;')

# Creazione della tabella theaters
cursor.execute('''
CREATE TABLE IF NOT EXISTS theaters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    size TEXT NOT NULL,
    rows INTEGER,
    columns INTEGER,
    seats INTEGER
)
''')

# Creazione della tabella users
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    name TEXT,
    hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    loyalty INTEGER NOT NULL DEFAULT 0
)
''')

# Creazione della tabella concerts
cursor.execute('''
CREATE TABLE IF NOT EXISTS concerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    theater_id INTEGER,
    FOREIGN KEY (theater_id) REFERENCES theaters(id)
)
''')

# Creazione della tabella reservations
cursor.execute('''
CREATE TABLE IF NOT EXISTS reservations (
    reservation_id INTEGER PRIMARY KEY AUTOINCREMENT,
    concert_id INTEGER,
    row INTEGER NOT NULL,
    place TEXT NOT NULL,
    user INTEGER,
    FOREIGN KEY (concert_id) REFERENCES concerts(id),
    FOREIGN KEY (user) REFERENCES users(id)
)
''')

# Creazione del trigger update_seats_before_insert
cursor.execute('''
CREATE TRIGGER update_seats_before_insert
AFTER INSERT ON theaters
FOR EACH ROW
BEGIN
    UPDATE theaters
    SET seats = NEW.rows * NEW.columns
    WHERE id = NEW.id;
END;
''')

# Inserimento dei dati nella tabella theaters
theaters_data = [
    ('Theatre 1', 'Small', 4, 8),
    ('Theatre 2', 'Medium', 6, 10),
    ('Theatre 3', 'Large', 9, 14)
]
cursor.executemany('''
INSERT INTO theaters (name, size, rows, columns)
VALUES (?, ?, ?, ?)
''', theaters_data)

# Inserimento dei dati nella tabella users
users_data = [
    ('u1@p.it', 'Alice', '8af3c8f074fc466e3c36f82bf8a37dbf7bb9f802c46dff931ecbd94b7cea1066', '3d3eff0e26a9f7e0b4009a6f719ecdd3', 1),
    ('u2@p.it', 'Bob', '616fbedf77e31d3bce18d0113997b59509e30796ff6dd47f93f5add4e904b22a', '9530cf128f2c172a826971fbd066dec8', 1),
    ('u3@p.it', 'Carl', 'd026edab755c12cc1380aa7db4eabf8baf0b703ba26ec700b6cf2fa42220a952', '5d3c7724d1a106a87bb68a485300bb8f', 0),
    ('u4@p.it', 'David', '6a41b8fca06179042e65b40d2f25ab975569c5856053bff8dfa7d1309cd34372', '5c2345e6ec1137c5d79b1cb936c8a9c6', 0),
    ('u5@p.it', 'Eva', '2889da7800d494489ac7729a35b830eb8430776ec82c7eb5c3a5d3e71d521238', 'dd6638b25a5f8c7f240e9535e5a6babc', 1),
    ('u6@p.it', 'Frank', '122ce4e302da5a265e79ac7227aacb1977ab61e5d927a15c2c9e51f4b1ff860e', '374ebdd31ea18405fdc8459728eef778', 0)
]
cursor.executemany('''
INSERT INTO users (email, name, hash, salt, loyalty)
VALUES (?, ?, ?, ?, ?)
''', users_data)

# Inserimento dei dati nella tabella concerts
concerts_data = [
    ('Vasco', 1),
    ('Lady Gaga', 1),
    ('Gabry Ponte', 2),
    ('Bob Sinclair', 2),
    ('David Guetta', 3),
    ('Rihanna', 3)
]
cursor.executemany('''
INSERT INTO concerts (name, theater_id)
VALUES (?, ?)
''', concerts_data)

# Inserimento dei dati nella tabella reservations
reservations_data = [
    (1, 1, 'A', 1),
    (1, 1, 'B', 1),
    (5, 3, 'C', 2),
    (5, 3, 'D', 2),
    (5, 3, 'E', 2),
    (5, 3, 'F', 2),
    (5, 3, 'G', 2),
    (1, 2, 'E', 3),
    (1, 2, 'F', 3),
    (1, 2, 'G', 3),
    (1, 2, 'H', 3),
    (5, 5, 'A', 4),
    (5, 5, 'B', 4)
]
cursor.executemany('''
INSERT INTO reservations (concert_id, row, place, user)
VALUES (?, ?, ?, ?)
''', reservations_data)

# Commit e chiusura della connessione
conn.commit()
conn.close()

print(f"Database '{db_filename}' creato con successo!")
