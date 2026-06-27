import { Outlet } from "react-router-dom"
import Appheader from "./AppHeader"


const AppLayout = () => {
    return (
        <div className="min-h-screen bg-[#1e1d1b] text-slate-100">
            <Appheader />
            <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 pt-17 sm:pt-24 pb-6 sm:pb-8">
                <Outlet />
            </main>
        </div>
    )
}

export default AppLayout