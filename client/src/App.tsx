import { useState } from 'react'
import './App.css'
import { DashboardPage } from './pages/DashboardPage'
import { InventoryPage } from './pages/InventoryPage'
import { StockPage } from './pages/StockPage'
import { WebhooksPage } from './pages/WebhooksPage'

type Tab = 'dashboard' | 'inventory' | 'stock' | 'webhooks'

const tabs: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'stock', label: 'Stock' },
  { id: 'webhooks', label: 'Webhooks' },
]

function App() {
  const [tab, setTab] = useState<Tab>('dashboard')

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">Roxas City · Academic Project</p>
          <h1>Military Inventory System</h1>
        </div>
        <nav className="nav">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={tab === t.id ? 'active' : ''}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {tab === 'dashboard' && <DashboardPage />}
        {tab === 'inventory' && <InventoryPage />}
        {tab === 'stock' && <StockPage />}
        {tab === 'webhooks' && <WebhooksPage />}
      </main>
    </div>
  )
}

export default App
