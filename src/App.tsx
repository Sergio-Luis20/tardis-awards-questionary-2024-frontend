import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Home from './views/Home';
import Questionary from './views/Questionary';
import Authenticated from './views/Authenticated';
import AdminPage from './views/AdminPage';
import Results from './views/Results';

const App : React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/authenticated' element={<Authenticated />} />
        <Route path='/admin' element={<AdminPage />} />
        <Route path='/questionary' element={<Questionary />} />
        <Route path='/results' element={<Results />} />
      </Routes>
    </Router>
  );
}

export default App;
