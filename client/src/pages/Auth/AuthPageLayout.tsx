import { type FC, type ReactNode } from "react";

interface AuthPageLayoutProps {
    children: ReactNode;
}

const AuthPageLayout: FC<AuthPageLayoutProps> = ({ children }) => {
    return (
        <>
            <div className="min-h-screen bg-[#2A2826] flex items-center justify-center px-4">
                <div className="w-full max-w-md bg-[#1e1c1a] border border-white/10 rounded-2xl shadow-2xl p-8">

                    {/* Header */}
                    <div className="flex flex-col items-center mb-8">
                        <span className="text-2xl font-bold text-white tracking-wide">
                            Military Inventory System
                        </span>
                        <p className="text-slate-400 text-sm mt-1">
                            Sign in to your account
                        </p>
                        <div className="w-12 h-1 bg-green-500 rounded-full mt-3" />
                    </div>

                    {/* children renders ToastMessage + LoginForm inside the card */}
                    {children}

                </div>
            </div>
        </>
    )
}

export default AuthPageLayout