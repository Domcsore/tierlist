import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CreateCategory from './routes/createCategory';

import Home from './routes/index';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-category" element={<CreateCategory />} />
      </Routes>
    </div>
  );
}
export default App;
