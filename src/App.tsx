import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { OrderList } from './pages/OrderList';
import { OrderDetail } from './pages/OrderDetail';
import { OrderCreate } from './pages/OrderCreate';
import { ProductList } from './pages/ProductList';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/orders/create" element={<OrderCreate />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/products" element={<ProductList />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
