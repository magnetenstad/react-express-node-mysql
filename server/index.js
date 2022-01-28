import express from 'express';
import { Database } from './db.js';

const PORT = process.env.PORT || 3001;
const app = express();
const db = new Database();

await db.init();

app.get('/api/get', async (request, result) => {
  result.send(JSON.stringify(await db.getNumbers()));
})

app.get('/api/insert', (request, result) => {
  let number = Math.floor(Math.random() * 100)
  db.insertNumber(number);
  result.send(JSON.stringify({"message": "Inserted " + number}));
})

app.get('/api/clear', (request, result) => {
  db.clearNumbers();
  result.send(JSON.stringify({"message": "Cleared numbers!"}));
})

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
