import { useEffect, useState } from "react"
import { useNavigate, NavLink, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const NAV_LINKS = [
    { label: 'Dashboard', to: '/Dashboard' },
    { label: 'Inventory', to: '/Inventory' },
    { label: 'Stock', to: '/Stock' },
    { label: 'Webhooks', to: '/Webhooks' },
]

const AppHeader = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        setMenuOpen(false)
    }, [location.pathname])

    const handleLogout = async () => {
        await logout()
        navigate("/")
    }

    const navClass = ({ isActive }: { isActive: boolean }) =>
        `text-sm transition-colors ${isActive ? 'text-green-400 font-medium' : 'text-white/60 hover:text-white'}`

    const mobileNavClass = ({ isActive }: { isActive: boolean }) =>
        `block rounded-lg px-3 py-2.5 text-sm transition-colors ${isActive ? 'bg-white/10 text-green-400 font-medium' : 'text-white/70 hover:bg-white/5 hover:text-white'}`

    return (
        <nav className="bg-[#242220] fixed w-full z-20 top-0 border-b border-white/10">
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between gap-3 py-3 sm:py-4">
                    <span className="text-sm sm:text-base font-semibold text-white truncate min-w-0">
                        Military Inventory System
                    </span>

                    <div className="hidden md:flex items-center gap-8">
                        {NAV_LINKS.map(({ label, to }) => (
                            <NavLink key={to} to={to} className={navClass}>
                                {label}
                            </NavLink>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-3 shrink-0">
                        <span className="text-sm text-slate-400 truncate max-w-[120px]">
                            {user?.user.username}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-red-700/50 text-red-400 hover:bg-red-700/20 hover:text-red-300 transition-colors whitespace-nowrap"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                            </svg>
                            Sign Out
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => setMenuOpen((open) => !open)}
                        className="md:hidden shrink-0 p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={menuOpen}
                    >
                        {menuOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>

                {menuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-[#242220] border-b border-white/10 shadow-xl px-4 py-4 space-y-4">
                        <div className="flex flex-col gap-1">
                            {NAV_LINKS.map(({ label, to }) => (
                                <NavLink key={to} to={to} className={mobileNavClass}>
                                    {label}
                                </NavLink>
                            ))}
                        </div>
                        <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
                            <span className="text-sm text-slate-400 truncate">
                                {user?.user.username}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-red-700/50 text-red-400 hover:bg-red-700/20 hover:text-red-300 transition-colors whitespace-nowrap"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default AppHeader
