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
