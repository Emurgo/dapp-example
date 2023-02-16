import './App.css';
import React from 'react';
import AccessButton from './components/accessButton';
import MainTab from './components/tabs/mainTab';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-800">
      <AccessButton />
      <MainTab />
    </div>
  );
}

export default App;
