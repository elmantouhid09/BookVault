/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Search } from './pages/Search';
import { BookDetail } from './pages/BookDetail';
import { Saved } from './pages/Saved';
import { Auth } from './pages/Auth';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="search" element={<Search />} />
          <Route path="book/:id" element={<BookDetail />} />
          <Route path="saved" element={<Saved />} />
        </Route>
        <Route path="/login" element={<Auth />} />
      </Routes>
    </Router>
  );
}
