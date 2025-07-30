🚗 Plateforme de Location de Véhicules - Node.js/Express/SQLite
📌 Description
API REST de gestion de location de véhicules avec :

Backend : Node.js + Express

Base de données : SQLite (sans ORM)

🔧 Installation
Cloner le dépôt

git clone https://github.com/BachirSylla/plateforme-location-vehicule.git
cd plateforme-location-vehicule

Installer les dépendances
npm install

Démarrer le serveur
npm start

📚 Endpoints de l'API
1. Gestion des véhicules
Méthode	Route	Description
POST	/vehicles	Ajouter un véhicule
GET	/vehicles	Lister tous les véhicules disponibles
GET	/vehicles/search?make=...	Rechercher par marque
GET	/vehicles/search?model=...	Rechercher par modèle
2. Gestion des clients
Méthode	Route	Description
POST	/clients	Inscrire un client
GET	/clients	Lister tous les clients
GET	/clients/search?name=...	Rechercher un client par nom
3. Gestion des locations
Méthode	Route	Description
POST	/rentals	Louer un véhicule
POST	/rentals/:id/return	Rendre un véhicule
GET	/vehicles/:id/rentals	Historique des locations d'un véhicule
GET	/clients/:id/rentals	Historique des locations d'un client

⚙️ Structure du Projet
text
.
├── database/               # Base SQLite (rentals.db)
├── services/               # Logique métier
│   ├── vehicle-service.mjs # CRUD véhicules
│   ├── client-service.mjs  # CRUD clients
│   └── rental-service.mjs  # Gestion locations
├── server.mjs             # Configuration Express
├── .gitignore              
└── package.json

📌 Exemple de Requête (CURL)
Ajouter un véhicule :

bash
curl -X POST http://localhost:3000/vehicles \
  -H "Content-Type: application/json" \
  -d '{"make":"Toyota", "model":"Corolla", "year":2022, "type":"Sedan", "dailyRate":50}'

  📝 Licence
Apache 2.0 - Libre d'utilisation et modification.

