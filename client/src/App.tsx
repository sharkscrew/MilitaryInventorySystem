import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { DashboardPage } from './pages/DashboardPage'
import { InventoryPage } from './pages/InventoryPage'
import { StockPage } from './pages/StockPage'
import { WebhooksPage } from './pages/WebhooksPage'

type Tab = 'dashboard' | 'inventory' | 'stock' | 'webhooks'

function App() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = useMemo(
    () =>
      [
        { id: 'dashboard' as const, label: 'Dashboard' },
        { id: 'inventory' as const, label: 'Inventory' },
        { id: 'stock' as const, label: 'Stock' },
        { id: 'webhooks' as const, label: 'Webhooks' },
      ] satisfies Array<{ id: Tab; label: string }>,
    [],
  )

  useEffect(() => {
    setSidebarOpen(false)
  }, [tab])

  return (
    <div className="min-h-screen bg-[#2A2826] text-slate-100">

      {/* Navbar — Flowbite sticky style */}
      <nav className="bg-[#242220] fixed w-full z-20 top-0 inset-s-0 border-b border-white/10">
        <div className="max-w-7xl flex flex-wrap items-center justify-between mx-auto p-4">

          {/* Logo */}
          <a href="#" className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="self-center text-xl text-white font-semibold whitespace-nowrap">
              Military Inventory System
            </span>
          </a>

          {/* Right side: CTA + Hamburger */}
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            <button
              type="button"
              className="text-white bg-green-700 hover:bg-green-600 border border-transparent focus:ring-4 focus:ring-green-800 font-medium rounded-lg text-sm px-3 py-2 focus:outline-none shadow-sm leading-5"
            >
              + New Product
            </button>

            {/* Hamburger (mobile only) */}
            <button
              type="button"
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-slate-400 rounded-lg md:hidden hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20 ml-2"
              aria-controls="navbar-sticky"
              aria-expanded={sidebarOpen}
              aria-label="Open main menu"
              onClick={() => setSidebarOpen((v) => !v)}
            >
              <span className="sr-only">Open main menu</span>
              <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M5 7h14M5 12h14M5 17h14" />
              </svg>
            </button>
          </div>

          {/* Nav links — desktop */}
          <div
            className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
            id="navbar-sticky"
          >
            <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-white/10 rounded-lg bg-white/5 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={[
                      'block py-2 px-3 rounded-sm text-sm transition-colors md:p-0 md:border-0',
                      tab === item.id
                        ? 'text-white bg-green-700 md:bg-transparent md:text-green-400'
                        : 'text-slate-300 hover:bg-white/10 md:hover:bg-transparent md:hover:text-green-400',
                    ].join(' ')}
                    aria-current={tab === item.id ? 'page' : undefined}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        <div
          className={[
            'md:hidden overflow-hidden transition-all duration-200',
            sidebarOpen ? 'max-h-96' : 'max-h-0',
          ].join(' ')}
          id="navbar-sticky-mobile"
        >
          <ul className="flex flex-col p-4 mt-0 font-medium border-t border-white/10 bg-[#060a06]">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={[
                    'w-full text-left block py-2 px-3 rounded-lg text-sm transition-colors',
                    tab === item.id
                      ? 'bg-green-700/30 text-green-400 font-semibold border border-green-700/40'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white border border-transparent',
                  ].join(' ')}
                  aria-current={tab === item.id ? 'page' : undefined}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Page content — offset by navbar height */}
      <main className="mx-auto max-w-7xl px-3 pt-24 pb-6">
        {tab === 'dashboard' && <DashboardPage />}
        {tab === 'inventory' && <InventoryPage />}
        {tab === 'stock' && <StockPage />}
        {tab === 'webhooks' && <WebhooksPage />}
      </main>
    </div>
  )
}

export default App