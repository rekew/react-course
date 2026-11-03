import { Route, Routes } from 'react-router-dom'
import RootLayout from './layouts/RootLayout.tsx'
import About from './pages/About.tsx'
import Dashboard from './pages/Dashboard.tsx'
import Home from './pages/Home.tsx'
import Login from './pages/Login.tsx'
import NotFound from './pages/NotFound.tsx'
import ProductDetails from './pages/ProductDetails.tsx'
import ProductsPage from './pages/ProductsPage.tsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetails />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
