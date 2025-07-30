import sqlite3 from 'sqlite3';

// Créer une instance de la base de données
const db = new sqlite3.Database('./database/rentals.db');

// Initialiser la table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      type TEXT NOT NULL,
      dailyRate REAL NOT NULL,
      available BOOLEAN DEFAULT 1
    )
  `);
});

class VehicleService {
  // Ajouter un véhicule
  static add(vehicle) {
    const { make, model, year, type, dailyRate } = vehicle;
    
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO vehicles (make, model, year, type, dailyRate) VALUES (?, ?, ?, ?, ?)',
        [make, model, year, type, dailyRate],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  // Lister tous les véhicules disponibles
  static getAll() {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM vehicles WHERE available = 1',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  // Rechercher par ID
  static getById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM vehicles WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  // Rechercher par marque
  static getByMake(make) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM vehicles WHERE make LIKE ? AND available = 1',
        [`%${make}%`],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  // Rechercher par modèle
  static getByModel(model) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM vehicles WHERE model LIKE ? AND available = 1',
        [`%${model}%`],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  // Mettre à jour la disponibilité
  static updateAvailability(id, available) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE vehicles SET available = ? WHERE id = ?',
        [available ? 1 : 0, id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
}

export default VehicleService;