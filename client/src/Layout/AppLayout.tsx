import { Outlet } from "react-router-dom"
import Appheader from "./AppHeader"


const AppLayout = () => {
    return (
        <div className="min-h-screen bg-[#1e1d1b] text-slate-100">
            <Appheader />
            <main className="mx-auto max-w-7xl px-6 pt-24 pb-8">
                <Outlet />
            </main>
        </div>
    )
}

export default AppLayout