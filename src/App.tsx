import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { OrderList } from './pages/OrderList';
import { OrderDetail } from './pages/OrderDetail';
import { OrderCreate } from './pages/OrderCreate';
import { ProductList } from './pages/ProductList';
import { StoreProvider } from './stores/StoreContext';

function App() {
  return (
    <StoreProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/ui" element={<Home />} />
            <Route path="/ui/orders" element={<OrderList />} />
            <Route path="/ui/orders/create" element={<OrderCreate />} />
            <Route path="/ui/orders/:id" element={<OrderDetail />} />
            <Route path="/ui/products" element={<ProductList />} />
          </Routes>
        </MainLayout>
      </Router>
    </StoreProvider>
  );
}

export default App;
