
# Demo for a webapp with the React - Express - Node - SQLite stack

## Commands

command | description
--- | ---
`npm run install:all` | Installs node modules in root, server and client directories
`npm run start` | Starts both the server, and the client
`npm run client:test` | Runs client unit tests (Jest)
`npm run cypress` | Runs end to end tests (Cypress)
`npm run lint:fix` | Analyses and fixes code style (ESLint)

## Steps to reproduce (~ 30 min)
Note: this tutorial is written for the PowerShell terminal.

1. Install Node.js from https://nodejs.org/en/ if you don't already have it installed

### Create a backend Node server with Express
2. Initialize git project, e.g. with `git init` or from GitHub/GitLab
3. Create a gitignore to ignore node modules and database data
```shell
echo **/node_modules/`nserver/data/ > .gitignore
```
4. Create a server directory and initialize Node
```shell
mkdir server; cd server; npm init -y
```
5. Install Express and nodemon
```shell
npm i express; npm i nodemon --save-dev
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
+   "start": "nodemon node",
+   "start:test": "nodemon node test"
  },
  ...
}
```
8. Start the server with `npm start` and you should see `Server listening on 3001`
   - `ctrl+C+C` in the terminal to terminate the server

### Create an SQLite database
9.  Make sure you are still in the `server` directory, install `better-sqlite3` and create a `data` folder
```shell
npm i better-sqlite3; mkdir data
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
const db = new NumbersDB(
  process.argv[2] === 'test' ? ':memory:' : './data/database.db');

server.get('/api/get', (request, result) => {
  result.send(JSON.stringify(db.getNumbers()));
});

server.put('/api/insert', (request, result) => {
  let number = Math.floor(Math.random() * 100);
  db.insertNumber(number);
  result.send();
});

server.delete('/api/clear', (request, result) => {
  db.clearNumbers();
  result.send();
});

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
```

### Create a React frontend
12. Return to the root directory and initialize React
```shell
cd ..; npx create-react-app client; cd client
```
13. Create the following file
```jsx
// client/src/components/Numbers.jsx
import {React, useEffect, useState} from 'react';

export function Numbers() {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [numbers, setNumbers] = useState([]);

  const getNumbers = () => {
    setIsLoaded(false);
    fetch('/api/get', {method: 'GET'})
        .then((res) => res.json())
        .then(
            (result) => {
              setIsLoaded(true);
              setNumbers(result);
            },
            (error) => {
              setIsLoaded(true);
              setError(error);
            },
        );
  };
  const insertNumber = () => {
    fetch('/api/insert', {method: 'PUT'})
        .then(() => getNumbers());
  };
  const clearNumbers = () => {
    fetch('/api/clear', {method: 'DELETE'})
        .then(() => getNumbers());
  };

  useEffect(() => getNumbers(), []);

  let liKey = 0;
  if (error) {
    return <h2>Error: {error.message}</h2>;
  } else if (!isLoaded) {
    return <h2>Loading...</h2>;
  } else {
    return (
      <div>
        <h2>Numbers:</h2>
        <ul>
          {numbers.map((number) => (
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
14. Delete `client/src/App.js` and create the following file
```js
// client/src/App.jsx
import {React} from 'react';
import logo from './logo.svg';
import './App.css';
import {Numbers} from './components/Numbers';

export default function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Hello world!</h1>
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

### Start the backend and frontend with a single command
17. Return to the root directory, initialize Node and install `concurrently`
```shell
cd ..; npm init -y;npm i concurrently --save-dev
```
18. Make the following edits to `package.json`
```diff
...
"scripts": {
+ "install:all": "npm i && cd server && npm i && cd ../client && npm i",
+ "server": "cd server && npm run start",
+ "server:test": "cd server && npm run start:test",
+ "client": "cd client && npm run start",
+ "start": "concurrently \"npm run server\" \"npm run client\"",
},
...
```
19. Start the server and client
```shell
npm start
```

### Set up unit tests with Jest
20. Make the following edit to `package.json`
```diff
"scripts": {
  ...
  "client": "cd client && npm run start",
+ "client:test": "cd client && npm test",
  "start": "concurrently \"npm run server\" \"npm run client\"",
},
```
21. Run the test
```shell
npm test
```
22.  The tests fail, since we have made changes to the app. Replace the test
```js
// client/src/App.test.js
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders hello world', () => {
  render(<App />);
  const helloWorld = screen.getByText(/hello world/i);
  expect(helloWorld).toBeInTheDocument();
});
```
23. Create the following file
```js
// client/src/components/Numbers.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { Numbers } from './Numbers';

it('renders numbers', async () => {
  // Mock the api
  let mockDB = [
    {'number': 0},
    {'number': 99}
  ];
  jest.spyOn(global, 'fetch').mockImplementation((url) => {
    switch(url) {
      case '/api/get':
        return Promise.resolve({
          json: () => Promise.resolve(mockDB)
        });
      case '/api/clear':
        mockDB = [];
        return Promise.resolve();
      case '/api/insert':
        let number = Math.floor(Math.random() * 100);
        mockDB.push(number);
        return Promise.resolve();
      default:
    }
  });

  // Use the asynchronous version of act to apply resolved promises
  await act(async () => {
    render(<Numbers />);
  });
  
  const listItems = screen.getAllByRole('listitem');
  expect(listItems).toHaveLength(2);
  expect(listItems[0].textContent).toBe('0');
  expect(listItems[1].textContent).toBe('99');
  expect(fetch).toHaveBeenCalledTimes(1);

  // A good read: https://testing-library.com/docs/queries/about/
  const clearButton = screen.getByText(/clear/i);
  await act(async () => {
    clearButton.click();
  });
  expect(fetch).toHaveBeenCalledTimes(3);
  expect(screen.queryAllByRole('listitem')).toHaveLength(0);

  const insertButton = screen.getByText(/insert/i);
  await act(async () => {
    insertButton.click();
  });
  expect(fetch).toHaveBeenCalledTimes(5);
  expect(screen.queryAllByRole('listitem')).toHaveLength(1);

  // remove the mock to ensure tests are completely isolated
  global.fetch.mockRestore();
});
```
24. The tests will automatically rerun on file changes. Hit `ctrl+C` to exit testing.

### Set up end to end tests with Cypress
25. Install `cypress` in the client directory
```shell
cd client; npm i cypress @testing-library/cypress --save-dev
```
26. Make the following edit to `client/package.json`
```diff
"scripts": {
  ...
  "eject": "react-scripts eject",
+ "cypress": "cypress open"
},
```
27. Open cypress
```shell
npm run cypress
```
28. Make the following edit to `client/cypress.json`
```diff
{
+  "baseUrl": "http://localhost:3000",
+  "videos": false
}
```
29. Make the following edit to `client/.gitignore`
```diff
...
+# Cypress
+cypress/screenshots/
+cypress/videos/
```
30. Make the following edit to `client/cypress/support/commands.js`
```diff
...
+import "@testing-library/cypress/add-commands";
```
31. Remove the contents of `client/cypress/integration` and `client/cypress/fixtures`
32. Create the following file
```js
// client/cypress/integration/numbers.test.js
it('should start by loading', () => {
  cy.visit('/');
  cy.get('h2').contains('Loading...');
});

it('should show header and buttons', () => {
  cy.visit('/');
  cy.wait(100);
  cy.get('h2').contains('Numbers:');
  cy.get('button').contains(/insert/i).should('exist');
  cy.get('button').contains(/clear/i).should('exist');
});

it('should clear and insert numbers', () => {
  cy.visit('/');
  cy.wait(100);
  cy.get('button').contains(/clear/i).click();
  cy.get('ul').find('li').should('have.length', 0);
  cy.get('button').contains(/insert/i).click();
  cy.get('ul').find('li').should('have.length', 1);
});
```
33. Make the following edit to `package.json`
```diff
"scripts": {
  ...
  "start": "concurrently \"npm run server\" \"npm run client\"",
+ "cypress": "concurrently \"npm run server:test\" \"npm run client\" \"cd client && npm run cypress\""
},
```
34. Run cypress from the root directory
```shell
cd ..; npm run cypress
```

TODO: Configure ESLint, https://gist.github.com/textbook/3377dda14efe4449772c2377188c3fa8

### Set up ESLint
35. Install and configure ESLint in the server directory
```shell
cd server; npm install eslint --save-dev; npm init @eslint/config; cd ..
```
36. Make the following edits to `server/package.json`
```diff
"scripts": {
  "start": "nodemon node",
  "start:test": "nodemon node test",
+ "lint": "npx eslint .",
+ "lint:fix": "npx eslint . --fix"
},
```
37. Install and configure ESLint in the client directory
```shell
cd client; npm i eslint --save-dev; npm i eslint-plugin-cypress --save-dev; npm init @eslint/config; cd ..
```
38. Make the following edits to `client/package.json`
```diff
"scripts": {
  ...
  "cypress": "cypress open",
+ "lint": "npx eslint .",
+ "lint:fix": "npx eslint . --fix"
},
```
39. Make the following edits to `client/.eslintrc.json`
```diff
{
    ...
+   "overrides": [
+       {
+           "files": ["*.jsx", "*.js"]
+       },
+       { 
+           "extends": [
+               "plugin:cypress/recommended"
+           ],
+           "files": [
+               "cypress/**/*.js"
+           ]
+       }
+   ],
+   "settings": {
+       "react": {
+         "version": "detect"
+       }
+   }
}
```
40. Make the following edits to `package.json`
```diff
"scripts": {
  ...
  "cypress": "concurrently \"npm run server:test\" \"npm run client\" \"cd client && npm run cypress\"",
+ "lint": "concurrently \"cd server && npm run lint\" \"cd client && npm run lint\"",
+ "lint:fix": "concurrently \"cd server && npm run lint:fix\" \"cd client && npm run lint:fix\""
},
```
