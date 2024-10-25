const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Middleware
app.use(express.json()); // To parse JSON request bodies

// Enable CORS for cross-origin requests
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// In-memory database
let persons = [
  {
    id: '1',
    name: 'Sam',
    age: 26,
    hobbies: [],
  },
];

// Set the database in the app
app.set('db', persons);

// Utility function to find a person by ID
const findPersonById = (id) => persons.find((person) => person.id === id);

// CRUD API for /person

// GET all persons or a specific person by ID
app.get('/person/:id?', (req, res) => {
  const { id } = req.params;
  const db = app.get('db'); // Get the database from app settings
  if (id) {
    const person = findPersonById(id);
    if (person) return res.status(200).json(person);
    return res.status(404).json({ message: 'Person not found' });
  }
  res.status(200).json(db);
});

// POST a new person
app.post('/person', (req, res) => {
  const { name, age, hobbies } = req.body;
  if (!name || typeof age !== 'number' || !Array.isArray(hobbies)) {
    return res.status(400).json({ message: 'Invalid data format' });
  }

  const newPerson = { id: uuidv4(), name, age, hobbies };
  persons.push(newPerson);
  res.status(200).json(newPerson);
});

// PUT to update an existing person by ID
app.put('/person/:id', (req, res) => {
  const { id } = req.params;
  const { name, age, hobbies } = req.body;

  if (!name || typeof age !== 'number' || !Array.isArray(hobbies)) {
    return res.status(400).json({ message: 'Invalid data format' });
  }

  const person = findPersonById(id);
  if (!person) return res.status(404).json({ message: 'Person not found' });

  person.name = name;
  person.age = age;
  person.hobbies = hobbies;
  res.status(200).json(person);
});

// DELETE an existing person by ID
app.delete('/person/:id', (req, res) => {
  const { id } = req.params;
  const personIndex = persons.findIndex((person) => person.id === id);
  if (personIndex === -1)
    return res.status(404).json({ message: 'Person not found' });

  persons.splice(personIndex, 1);
  res.status(204).send(); // No content for successful deletion
});

// Handle non-existing routes
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Handle internal server errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

if (require.main === module) {
  app.listen(3000, () =>
    console.log('Server running on http://localhost:3000')
  );
}

module.exports = app;
