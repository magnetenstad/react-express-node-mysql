import express from 'express';
import { Database } from './db.js';

const PORT = 3001;
const server = express();
const db = new Database();

await db.init();

server.get('/api/get', async (request, result) => {
  result.send(JSON.stringify(await db.getNumbers()));
})

server.put('/api/insert', (request, result) => {
  let number = Math.floor(Math.random() * 100)
  db.insertNumber(number);
  result.send(JSON.stringify({"message": "Inserted " + number}));
})

server.delete('/api/clear', (request, result) => {
  db.clearNumbers();
  result.send(JSON.stringify({"message": "Cleared numbers!"}));
})

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
