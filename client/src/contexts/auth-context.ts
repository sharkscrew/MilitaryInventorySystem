import { createContext } from "react"
import type { UserDetails } from "../interfaces/AuthInterface"

export interface AuthContextType {
    user: UserDetails | null
    loading: boolean
    login: (username: string, password: string) => Promise<void>
    logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
