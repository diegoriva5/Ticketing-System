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
    column TEXT NOT NULL,
    user_id INTEGER,
    FOREIGN KEY (concert_id) REFERENCES concerts(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
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
    ('Theater 1', 'Small', 4, 8),
    ('Theater 2', 'Medium', 6, 10),
    ('Theater 3', 'Large', 9, 14)
]
cursor.executemany('''
INSERT INTO theaters (name, size, rows, columns)
VALUES (?, ?, ?, ?)
''', theaters_data)

# Inserimento dei dati nella tabella users
users_data = [
    ('u1@p.it', 'Alice', 'e5bae065fbee2f508bb907f69f95fc0b132e14756bd19d5619d5d6c8bf9d8834dc1e3ad6a28801d718f29c0ab2d9282f9a2002d7375bcbcc84e82e241919b56b', '0c84a99ce770ec2d4f32734a86944053', 1),
    ('u2@p.it', 'Bob', '2e5f7a6ae2d614fcffb78cb2dc4dad7749520919986b8777284aac2858d8895cdb5091ff76f9656a663c970ca53516407453b1396ed1aa6be6e37d0caa604bd0', '970119858650b567237c2e099a437e33', 1),
    ('u3@p.it', 'Carl', 'b98f0caa2c0fe738f92ae24d4f89ee35f6ae3d0f848cf1f9955b72d0e55687351aa3b559dfcd9d87a4ed5119bb34e6f1e958f25e845cfba8fd685d2190178169', '5908898765e488a6e9408be53530ef70', 0),
    ('u4@p.it', 'David', '41a78823dc57091a5574a8f9632bad4dabaa3387a26ef3d005f62947e76c1609ea00a73f8b5592ce2c26960994a979bac6e7dc472ec89cbe92b560f2276e2224', 'e968d4c64be71aeabaae5ec2f0d14365', 0),
    ('u5@p.it', 'Eva', '9dea75549095513cdd55cb3b87bb33018f1aeeeccdedd2e3ca053126c2b455d39c51f382fc3ac4e9935dad18bc058686a2936cb7c8e0265ae2481f80079aeea1', '0cbe7166815d0d0dc0930e8b09c2a361', 1),
    ('u6@p.it', 'Frank', 'c7031be6839c4faa9777ef80c106b3a5b74004635c633d580e0524ae8bcff3ce8e676a4a15b88509189bf365176ebcc88a6f8b1ddcb7ea0f156fe45c8e9641c3', '2561d63b17b971c60f5dcaf943df572e', 0)
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
INSERT INTO reservations (concert_id, row, column, user_id)
VALUES (?, ?, ?, ?)
''', reservations_data)

# Commit e chiusura della connessione
conn.commit()
conn.close()

print(f"Database '{db_filename}' creato con successo!")
