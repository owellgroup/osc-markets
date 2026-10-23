import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useBasket } from '../context/BasketContext'
import CategoryNav from './CategoryNav'
import Icon from './Icon'
import SocialIcons from './SocialIcons'

function BasketButton() {
  const { totalQuantity } = useBasket()
  const [bump, setBump] = useState(false)
  const prev = useRef(totalQuantity)

  useEffect(() => {
    if (totalQuantity > prev.current) {
      setBump(true)
      const t = window.setTimeout(() => setBump(false), 450)
      prev.current = totalQuantity
      return () => window.clearTimeout(t)
    }
    prev.current = totalQuantity
  }, [totalQuantity])

  return (
    <Link to="/basket" className="basket-btn" aria-label={`Quote basket, ${totalQuantity} items`}>
      <Icon name="bag" size={18} stroke={2} />
      <span className="basket-label">Quote Basket</span>
      <span className={`basket-count${bump ? ' bump' : ''}`}>{totalQuantity}</span>
    </Link>
  )
}

export default function PublicLayout() {
  const { pathname } = useLocation()
  const [menu, setMenu] = useState(false)
  useEffect(() => {
    window.scrollTo(0, 0)
    setMenu(false)
  }, [pathname])

  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <Link to="/" className="brand" aria-label="OSC Markets home">
            <img src="/logo.png" alt="OSC Store" />
          </Link>
          <button className="nav-toggle" type="button" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu((o) => !o)}>
            <Icon name={menu ? 'close' : 'menu'} size={20} />
          </button>
          <nav className={`nav-links${menu ? ' open' : ''}`}>
            <NavLink to="/products" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Products</NavLink>
            <NavLink to="/solutions" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Solutions</NavLink>
            <Link to="/basket" className="nav-link nav-link-mobile">Quote basket</Link>
            <SocialIcons className="socials-mobile" />
          </nav>
          <SocialIcons className="socials-desktop" />
          <BasketButton />
        </div>
      </header>
      <CategoryNav />
      <main>
        <Outlet />
      </main>
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <img src="/logo-white.png" alt="OSC Store" className="footer-logo" />
            <p>Browse our products and solutions, build your quote basket and receive a formal quotation from the OSC team.</p>
          </div>
          <div className="footer-links">
            <Link to="/products">Products</Link>
            <Link to="/solutions">Solutions</Link>
            <Link to="/basket">Quote basket</Link>
          </div>
        </div>
        <div className="footer-inner"><small>© {new Date().getFullYear()} OSC Markets. Pricing is provided on formal quotation only.</small></div>
      </footer>
    </>
  )
}
