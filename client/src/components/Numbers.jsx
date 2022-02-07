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
