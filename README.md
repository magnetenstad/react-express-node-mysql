
# Template for a React - Express - Node - MySQL stack

## Steps to reproduce
This tutorial is inspired by https://www.freecodecamp.org/news/how-to-create-a-react-app-with-a-node-backend-the-complete-guide/

### Create a backend Node server with Express
1. Initialize git project, e.g. with `git init` or from GitHub
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
7. Start the server `npm start`
   - `ctrl+C` in terminal to stop the server
