
# Demo for a webapp with the React - Express - Node - SQLite stack

## Steps to reproduce (~ 20 min)
1. Install Node.js from https://nodejs.org/en/ if you don't already have it installed

### Create a backend Node server with Express
2. Initialize git project, e.g. with `git init` or from GitHub/GitLab
3. Create a gitignore to ignore node modules and database data
```shell
echo **/node_modules/`nserver/data/ > .gitignore
```
4. Create a server directory and initialize Node
```shell
mkdir server && cd server && npm init -y
```
5. Install Express and nodemon
```shell
npm i express && npm i nodemon --save-dev
```
6. Create the following file:
```js
// server/src/index.js    <-- This indicates the filename
import express from 'express';

const PORT = 3001;
const app = express();

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
```
7. Make the following edits to `server/package.json`
```diff
{
  "name": "server",
  "version": "1.0.0",
  "description": "",
+ "main": "src/index.js",
+ "type": "module",
  "scripts": {
+   "start": "nodemon node"
  },
  ...
}
```
8. Start the server with `npm start` and you should see `Server listening on 3001`
   - `ctrl+C+C` in the terminal to terminate the server

### Create an SQLite database
9.  Make sure you are still in the `server` directory, install `better-sqlite3` and create a `data` folder
```shell
npm i better-sqlite3 && mkdir data
```
10. Create the following file
```js
// server/src/db.js
import Database from 'better-sqlite3';

export class NumbersDB {
  constructor(filename) {
    this.db = new Database(filename,
      { verbose: (msg) => console.log('[DB] ' + msg) });
    this.stmt_create = this.db.prepare(
      'CREATE TABLE IF NOT EXISTS numbers (number int)');
    this.stmt_create.run();
    
    this.stmt_get = this.db.prepare(
      'SELECT * FROM numbers');
    this.stmt_insert = this.db.prepare(
      'INSERT INTO numbers (number) VALUES (?)');
    this.stmt_clear = this.db.prepare(
      'DELETE FROM numbers');
  }
  
  getNumbers() {
    return this.stmt_get.all();
  }
  
  insertNumber(number) {
    this.stmt_insert.run(number);
  }

  clearNumbers() {
    this.stmt_clear.run();
  }
}
```
11. Replace the contents of `server/src/index.js` with the following
```js
// server/src/index.js
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
```

### Create a React frontend
12. Return to the root directory and initialize React
```shell
cd .. && npx create-react-app client && cd client
```
13. Create the following file
```jsx
// client/src/components/Numbers.jsx
import { useEffect, useState } from 'react';

export function Numbers() {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [numbers, setNumbers] = useState([]);

  const getNumbers = () => {
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
```
14. Replace the contents of `client/src/App.js` with the following
```js
// client/src/App.js
import logo from './logo.svg';
import './App.css';
import { Numbers } from './components/Numbers';

export default function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Numbers/>
      </header>
    </div>
  );
}
```
15. Add `"proxy": "http://localhost:3001"` to `client/package.json`
16. Start the client
```shell
npm start
```
  - To communicate with the server, it needs to be running in a separate terminal window

### Starting the backend and frontend with a single command
17. Return to the root directory, initialize Node and install `concurrently`
```shell
cd .. && npm init -y && npm i concurrently --save-dev
```
18. Make the following edits to `package.json`
```diff
...
"scripts": {
+ "install": "cd server && npm i && cd ../client && npm i",
+ "server": "cd server && npm run start",
+ "client": "cd client && npm run start",
+ "start": "concurrently \"npm run server\" \"npm run client\""
},
...
```
19. Start the server and client
```shell
npm start
```
