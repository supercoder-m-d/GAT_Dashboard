import React, { useState } from 'react';
import './App.css';
import Header from './components/Header/Header';
import Main from './components/Main/Main';
import web3 from './web3';
function App() {
  
  const [currentAddress, setCurrentAddress] = useState('');
  
  const onAddressChange = (value) => {    
      setCurrentAddress(value);
  }
 
  return (
    <div className="App">
      <Header currentAddress={currentAddress} onAddressChange={onAddressChange}></Header>
      <Main currentAddress={currentAddress} onAddressChange={onAddressChange}></Main>

    </div>
  );
}

export default App;
