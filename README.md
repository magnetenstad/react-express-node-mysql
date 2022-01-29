
# Template for a React - Express - Node - SQLite stack

## Steps to reproduce
1. Install Node.js from https://nodejs.org/en/ if you don't already have it installed.

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
1. Install Express `npm i express` and nodemon `npm i nodemon --save-dev`
2. Create the following file:
```js
// server/index.js
import express from 'express';

const PORT = process.env.PORT || 3001;
const app = express();

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

```
6. Add `"type": "module"` to `package.json`
7. Add `"server": "nodemon node server/index.js"` to `scripts` in `package.json`
8. Start the server `npm run server`, if you see the message `Server listening on 3001`, you have successfully setup a server!
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
    console.log("[DB] Init");
    await this.db.exec('CREATE TABLE IF NOT EXISTS numbers (number int)');
  }
  
  async getNumbers() {
    console.log("[DB] GET");
    return await this.db.all('SELECT * FROM numbers');
  }
  
  async insertNumber(number) {
    console.log("[DB] INSERT " + number);
    await this.db.exec('INSERT INTO numbers (number) VALUES (' + number + ')');
  }

  async clearNumbers() {
    console.log("[DB] CLEAR");
    await this.db.exec('DELETE FROM numbers');
  }
}
```
3. Create an empty file `data/database.db` and add `data/` to `.gitignore`
4.  Replace the contents of `server/index.js` with the following:
```js
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
```
5. Start the server with `npm run server`
6. Open a browser and visit `localhost:3001/api/get`, `localhost:3001/api/insert` and `localhost:3001/api/clear`. If they all show relevant messages, your database is working!

### Create a React frontend
1. Initialize React `npx create-react-app client`
   - `client` will be the name of the created folder and React project
2. Add `"proxy": "http://localhost:3001"` to `client/package.json`
   - To communicate with the server, running on port `3001`
3. Add `"client": "cd client && npm start"` to `scripts` in `package.json` (in the root folder, not in `client/`!)
4. Replace the contents of `client/src/App.js` with the following:
```js
import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from "react";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {NumbersComponent()}
      </header>
    </div>
  );
}

function NumbersComponent() {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [numbers, setNumbers] = useState([]);
  
  const getNumbers = async () => {
    fetch('/api/get')
      .then(res => res.json())
      .then(
        (result) => {
          setIsLoaded(true);
          setNumbers(result);
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      )
  }
  const insertNumber = () => {
    fetch('/api/insert').then(() => getNumbers())
  }
  const clearNumbers = () => {
    fetch('/api/clear').then(() => getNumbers())
  }

  useEffect(() => getNumbers(), [])

  if (error) {
    return <div>Error: {error.message} {numbers}</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <div>
      <ul>
        <p>Numbers:</p>
        {numbers.map(number => (
          <li>
            {number.number}
          </li>
        ))}
      </ul>
      <button onClick={insertNumber}>Insert number</button>
      <button onClick={clearNumbers}>Clear numbers</button>
      </div>
    );
  }
}

export default App;
```
1. Start the server `npm run server`
2. Open **another terminal** and start the client `npm run client`
3. Open `localhost:3000` in a browser. If insert and clear buttons are displayed, and numbers are updating when buttons are pressed, you have successfully created a webapp with the React - Express - Node - SQLite stack!
