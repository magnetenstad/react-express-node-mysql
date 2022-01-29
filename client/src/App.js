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
      );
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
