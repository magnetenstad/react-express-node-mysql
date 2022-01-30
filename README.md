
# Demo for a webapp with the React - Express - Node - SQLite stack

## Steps to reproduce (~ 20 min)
1. Install Node.js from https://nodejs.org/en/ if you don't already have it installed.

### Create a backend Node server with Express
2. Initialize git project, e.g. with `git init` or from GitHub/GitLab
3. Initialize Node `npm init -y`
   - ( `-y` is to skip setting properties manually )
4. Create the following file:
   - (to avoid adding dependency node modules to the git repo)
```js
// .gitignore
node_modules/
```
5. Install Express `npm i express` and nodemon `npm i nodemon --save-dev`
6. Create the following file:
```js
// server/index.js
import express from 'express';

const PORT = process.env.PORT || 3001;
const app = express();

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

```
7. Add `"type": "module"` to `package.json`
8. Add `"server": "nodemon node server/index.js"` to `scripts` in `package.json`
9. Start the server `npm run server`, if you see the message `Server listening on 3001`, you have successfully setup a server!
   - `ctrl+C` in terminal to stop the server

### Create an SQLite database
10. Install SQLite and SQLite3 `npm i sqlite sqlite3`
11. Create the following file:
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
12. Create an empty file `data/database.db` and add `data/` to `.gitignore`
13.  Replace the contents of `server/index.js` with the following:
```js
import express from 'express';
import { Database } from './db.js';

const PORT = process.env.PORT || 3001;
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
```
14. Start the server with `npm run server`
15. Open a browser and visit `localhost:3001/api/get`, `localhost:3001/api/insert` and `localhost:3001/api/clear`. Visiting the urls should trigger the following functions:
    - `../get` shows the database content (will be empty at first)
    - `../insert` inserts a random number (0-100) into the database
    - `../clear` deletes all numbers in the database
If they all show relevant messages, your database is working! 

### Create a React frontend
16. Initialize React `npx create-react-app client`
   - `client` will be the name of the created folder and React project
17. Add `"proxy": "http://localhost:3001"` to `client/package.json`
   - To communicate with the server, running on port `3001`
18. Add `"client": "cd client && npm start"` to `scripts` in `package.json` (in the root folder, not in `client/`!)
19. Create the following file:
    - To prevent changes to the client and readme to hot reload the server.
```json
// nodemon.json
{   
  "ignore": ["client/**", "README.md"] 
}
```
20. Replace the contents of `client/src/App.js` with the following:
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
    setIsLoaded(false);
    fetch('/api/get', {method: 'GET'})
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
      );
  }
  const insertNumber = () => {
    fetch('/api/insert', {method: 'PUT'})
      .then(() => getNumbers())
  }
  const clearNumbers = () => {
    fetch('/api/clear', {method: 'DELETE'})
      .then(() => getNumbers())
  }

  useEffect(() => getNumbers(), [])

  let liKey = 0;
  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <div>    
      <ul>
        <p>Numbers:</p>
        {numbers.map(number => (
          <li key={liKey++}>
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
20. Start the server `npm run server`
21. Open **another terminal** and start the client `npm run client`
22. Open `localhost:3000` in a browser. If insert and clear buttons are displayed, and numbers are updating when buttons are pressed, you have successfully created a webapp with the React - Express - Node - SQLite stack!
