import express from 'express';
import VehicleService from './services/vehicle-service.mjs';
import ClientService from './services/client-service.mjs';
import RentalService from './services/rental-service.mjs';

const app = express();
const port = 3000;


app.use(express.json());

// 1. Routes pour les véhicules
app.post('/vehicles', async (req, res) => {
  try {
    const id = await VehicleService.add(req.body);
    res.status(201).json({ id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await VehicleService.getAll();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/vehicles/search', async (req, res) => {
  try {
    const { make, model } = req.query;
    let results;
    
    if (make) {
      results = await VehicleService.getByMake(make);
    } else if (model) {
      results = await VehicleService.getByModel(model);
    } else {
      return res.status(400).json({ error: "Paramètre de recherche manquant" });
    }
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Routes pour les clients
app.post('/clients', async (req, res) => {
  try {
    const id = await ClientService.add(req.body);
    res.status(201).json({ id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/clients', async (req, res) => {
  try {
    const clients = await ClientService.getAll();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/clients/search', async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ error: "Paramètre 'name' manquant" });
    }
    
    const clients = await ClientService.getByName(name);
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Routes pour les locations
app.post('/rentals', async (req, res) => {
  try {
    const { vehicleId, clientId, days } = req.body;
    
    // Vérifier la disponibilité
    const isAvailable = await RentalService.isVehicleAvailable(vehicleId);
    if (!isAvailable) {
      return res.status(400).json({ error: "Véhicule non disponible" });
    }
    
    // Calculer le coût total
    const vehicle = await VehicleService.getById(vehicleId);
    const totalCost = vehicle.dailyRate * days;
    
    // Date de début (aujourd'hui) et de fin
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Créer la location
    const rentalId = await RentalService.rentVehicle({
      vehicleId,
      clientId,
      startDate: startDateStr,
      endDate: endDateStr,
      totalCost
    });
    
    res.status(201).json({ id: rentalId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/rentals/:id/return', async (req, res) => {
  try {
    await RentalService.returnVehicle(req.params.id);
    res.json({ message: "Véhicule retourné avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/vehicles/:id/rentals', async (req, res) => {
  try {
    const rentals = await RentalService.getRentalsByVehicle(req.params.id);
    res.json(rentals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/clients/:id/rentals', async (req, res) => {
  try {
    const rentals = await RentalService.getRentalsByClient(req.params.id);
    res.json(rentals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur de location de véhicules démarré sur le port ${port}`);
});