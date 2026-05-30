import { Outlet } from "react-router-dom"
import Appheader from "./AppHeader"


const AppLayout = () => {
    return (
        <div className="min-h-screen bg-[#2A2826] text-slate-100">
            <Appheader />
            <main className="mx-auto max-w-7xl px-3 pt-24 pb-6">
                <Outlet />
            </main>
        </div>
    )
}

export default AppLayout