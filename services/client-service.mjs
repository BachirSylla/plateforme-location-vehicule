import sqlite3 from 'sqlite3';

// Créer une instance de la base de données
const db = new sqlite3.Database('./database/rentals.db');

// Initialiser la table (version simplifiée sans async/await)
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      licenseNumber TEXT UNIQUE NOT NULL
    )
  `);
});

class ClientService {
  // Inscrire un client (version avec Promises)
  static add(client) {
    const { firstName, lastName, email, phone, licenseNumber } = client;
    
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO clients (firstName, lastName, email, phone, licenseNumber) VALUES (?, ?, ?, ?, ?)',
        [firstName, lastName, email, phone, licenseNumber],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  // Lister tous les clients
  static getAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM clients', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Rechercher par ID
  static getById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM clients WHERE id = ?', 
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  // Rechercher par nom
  static getByName(name) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM clients WHERE firstName LIKE ? OR lastName LIKE ?',
        [`%${name}%`, `%${name}%`],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }
}

export default ClientService;