import express from 'express';
import { NumbersDB } from './db.js';

const PORT = 3001;
const server = express();
const db = new NumbersDB('./data/database.db');

server.get('/api/get', (request, result) => {
  result.send(JSON.stringify(db.getNumbers()));
})

server.put('/api/insert', (request, result) => {
  let number = Math.floor(Math.random() * 100)
  db.insertNumber(number);
  result.send();
})

server.delete('/api/clear', (request, result) => {
  db.clearNumbers();
  result.send();
})

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});