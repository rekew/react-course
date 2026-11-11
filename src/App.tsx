import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Loader from './components/Loader.tsx'
import RootLayout from './layouts/RootLayout.tsx'
import Home from './pages/Home.tsx'
import Login from './pages/Login.tsx'
import NotFound from './pages/NotFound.tsx'
import ProductsPage from './pages/ProductsPage.tsx'
import Signup from './pages/Signup.tsx'

const About = lazy(() => import('./pages/About.tsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.tsx'))
const ProductDetails = lazy(() => import('./pages/ProductDetails.tsx'))

function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
