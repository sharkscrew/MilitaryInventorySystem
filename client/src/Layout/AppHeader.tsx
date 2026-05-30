import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useState } from "react"

const AppHeader = () => {
    const [menuOpen, setMenuOpen] = useState(false)
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate("/")
    }

    return (
        <nav className="bg-[#242220] fixed w-full z-20 top-0 border-b border-white/10">
            <div className="max-w-7xl flex items-center justify-between mx-auto p-4">

                {/* Logo */}
                <span className="text-xl text-white font-semibold whitespace-nowrap">
                    Military Inventory System
                </span>

                {/* Right: username + sign out */}
                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400">
                        {user?.user.username}
                    </span>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-red-700/50 text-red-400 hover:bg-red-700/20 hover:text-red-300 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                        </svg>
                        Sign Out
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default AppHeader