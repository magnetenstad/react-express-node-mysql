
# Template for a React - Express - Node - MySQL stack
A simple counter app

## Steps to reproduce

### Create a backend Node server with Express
1. Initialize git project, e.g. with `git init` or from GitHub/GitLab
2. Initialize Node `npm init -y`
   - ( `-y` is to skip setting properties manually )
3. Create the following file:
   - (to avoid adding dependency node modules to the git repo)
```js
// .gitignore
node_modules/
```
4. Install Express `npm i express`
5. Create the following file:
```js
// server/index.js
const express = require("express");

const PORT = process.env.PORT || 3001;
const app = express();

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
```
6. Add `"server": "node server/index.js"` to `scripts` in `package.json`
7. Start the server `npm run server`
   - `ctrl+C` in terminal to stop the server

### Create an SQLite database
1. Install SQLite and SQLite3 `npm i sqlite sqlite3`
2. Create the following file:

```js
// server/db.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export { Database };

class Database {
  db;
  
  async init() {
    this.db = await open({
      filename: './data/database.db',
      driver: sqlite3.Database
    });
    await this.initNumbers();
  }
  
  async initNumbers() {
    await this.db.exec('CREATE TABLE IF NOT EXISTS numbers (number int)');
  }
  
  async getNumbers() {
    return await this.db.all('SELECT * FROM numbers');
  }
  
  async insertNumber(number) {
    await this.db.exec('INSERT INTO numbers (number) VALUES (' + number + ')');
  }

  async clearNumbers() {
    await this.db.exec('DELETE FROM numbers');
  }
}
```
3. Create an empty file `data/database.db`
4. Make the following additions to  `server/index.js`:
```diff
import express from 'express';
+import { Database } from './db.js';

const PORT = process.env.PORT || 3001;
const app = express();
+const db = new Database();

+await db.init();

+app.get('/api/get', async (request, result) => {
+  result.send("Random numbers: " + JSON.stringify(await db.getNumbers()));
+})

+app.get('/api/add', (request, result) => {
+  db.insertNumber(Math.floor(Math.random() * 100));
+  result.send("Added a random number (0-100)!");
+})

+app.get('/api/clear', (request, result) => {
+  db.clearNumbers();
+  result.send("Cleared numbers!");
+})

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
```
5. Start the server with `npm run server` and make sure `localhost:3001/api/get`, `localhost:3001/api/add` and `localhost:3001/api/clear` are working.

### Create a React frontend
1. Initialize React `npx create-react-app client`
   - `client` will be the name of the created folder and React project
2. Add `"proxy": "http://localhost:3001"` to `client/package.json`
   - To communicate with the server, running on port `3001`
3. Add `"client": "cd client && npm start"` to `scripts` in `package.json`
4. Start the React app `npm run client`
