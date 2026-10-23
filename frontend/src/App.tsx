import { Navigate, Route, Routes } from 'react-router-dom'
import PublicLayout from './components/PublicLayout'
import { useAuth } from './context/AuthContext'
import Basket from './pages/Basket'
import Catalog from './pages/Catalog'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import QuoteSent from './pages/QuoteSent'
import AdminLayout from './pages/admin/AdminLayout'
import Admins from './pages/admin/Admins'
import Banners from './pages/admin/Banners'
import Login from './pages/admin/Login'
import ProductForm from './pages/admin/ProductForm'
import Products from './pages/admin/Products'
import QuoteEditor from './pages/admin/QuoteEditor'
import Quotes from './pages/admin/Quotes'
import { NamedManager, OptionsManager } from './pages/admin/Taxonomy'

function SuperOnly({ children }: { children: JSX.Element }) {
  const { admin } = useAuth()
  return admin?.role === 'SUPER_ADMIN' ? children : <Navigate to="/admin" replace />
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Catalog type="PRODUCT" />} />
        <Route path="solutions" element={<Catalog type="SOLUTION" />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="basket" element={<Basket />} />
        <Route path="quote-sent" element={<QuoteSent />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Quotes />} />
        <Route path="quotes/:id" element={<QuoteEditor />} />
        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id" element={<ProductForm />} />
        <Route path="categories" element={<NamedManager kind="categories" />} />
        <Route path="brands" element={<NamedManager kind="brands" />} />
        <Route path="options" element={<OptionsManager />} />
        <Route path="banners" element={<Banners />} />
        <Route path="admins" element={<SuperOnly><Admins /></SuperOnly>} />
      </Route>
    </Routes>
  )
}
