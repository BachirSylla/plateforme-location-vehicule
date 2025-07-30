import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database/rentals.db');

// Initialisation de la table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS rentals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicleId INTEGER NOT NULL,
      clientId INTEGER NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT,
      totalCost REAL,
      returned BOOLEAN DEFAULT 0,
      FOREIGN KEY (vehicleId) REFERENCES vehicles (id),
      FOREIGN KEY (clientId) REFERENCES clients (id)
    )
  `);
});

class RentalService {
  // Exécuter une transaction
  static _runTransaction(operations) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        
        const rollback = (err) => {
          db.run("ROLLBACK", (rollbackErr) => {
            reject(rollbackErr || err);
          });
        };

        operations(db)
          .then((result) => {
            db.run("COMMIT", (commitErr) => {
              if (commitErr) rollback(commitErr);
              else resolve(result);
            });
          })
          .catch(rollback);
      });
    });
  }

  // Louer un véhicule
  static rentVehicle(rental) {
    const { vehicleId, clientId, startDate, endDate, totalCost } = rental;
    
    return this._runTransaction(async (db) => {
      return new Promise((resolve, reject) => {
        // Créer la location
        db.run(
          'INSERT INTO rentals (vehicleId, clientId, startDate, endDate, totalCost) VALUES (?, ?, ?, ?, ?)',
          [vehicleId, clientId, startDate, endDate, totalCost],
          function(err) {
            if (err) return reject(err);
            
            // Marquer le véhicule comme indisponible
            db.run(
              'UPDATE vehicles SET available = 0 WHERE id = ?',
              [vehicleId],
              (updateErr) => {
                if (updateErr) return reject(updateErr);
                resolve(this.lastID);
              }
            );
          }
        );
      });
    });
  }

  // Rendre un véhicule
  static returnVehicle(rentalId) {
    return this._runTransaction((db) => {
      return new Promise((resolve, reject) => {
        // Récupérer l'ID du véhicule
        db.get(
          'SELECT vehicleId FROM rentals WHERE id = ?',
          [rentalId],
          (err, rental) => {
            if (err) return reject(err);
            if (!rental) return reject(new Error('Location non trouvée'));

            // Marquer comme retourné
            db.run(
              'UPDATE rentals SET returned = 1, endDate = DATE() WHERE id = ?',
              [rentalId],
              (updateErr) => {
                if (updateErr) return reject(updateErr);

                // Marquer le véhicule comme disponible
                db.run(
                  'UPDATE vehicles SET available = 1 WHERE id = ?',
                  [rental.vehicleId],
                  (vehicleUpdateErr) => {
                    if (vehicleUpdateErr) return reject(vehicleUpdateErr);
                    resolve();
                  }
                );
              }
            );
          }
        );
      });
    });
  }

  // Lister les locations pour un véhicule
  static getRentalsByVehicle(vehicleId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT r.*, c.firstName, c.lastName 
         FROM rentals r
         JOIN clients c ON r.clientId = c.id
         WHERE r.vehicleId = ?`,
        [vehicleId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  // Lister les locations pour un client
  static getRentalsByClient(clientId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT r.*, v.make, v.model, v.type 
         FROM rentals r
         JOIN vehicles v ON r.vehicleId = v.id
         WHERE r.clientId = ?`,
        [clientId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  // Vérifier si un véhicule est disponible
  static isVehicleAvailable(vehicleId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT available FROM vehicles WHERE id = ?',
        [vehicleId],
        (err, vehicle) => {
          if (err) reject(err);
          else resolve(vehicle && vehicle.available === 1);
        }
      );
    });
  }
}

export default RentalService;