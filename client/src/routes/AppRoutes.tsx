import { Navigate, Route, Routes } from "react-router-dom"
import LoginPage from "../pages/Auth/LoginPage"
import ProtectedRoute from "./ProtectedRoute"
import DashboardPage from "../pages/DashboardPage"
import InventoryPage from "../pages/InventoryPage"
import StockPage from "../pages/StockPage"
import WebhooksPage from "../pages/WebhooksPage"
import AppLayout from "../Layout/AppLayout"

const AppRoutes = () => {
    return (
        <>
            <Routes>
                <Route path='/' element={<LoginPage />}/>
                <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                    <Route path="/Dashboard" element={<DashboardPage />} />
                    <Route path="/Inventory" element={<InventoryPage />} />
                    <Route path="/Stock" element={<StockPage />} />
                    <Route path="/Webhooks" element={<WebhooksPage />} />
                </Route>
            </Routes>
        </>
    )
}
export default AppRoutes