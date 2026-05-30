import { useState, type FC, type FormEvent } from "react";
import SubmitButton from "../../../components/Button/SubmitButton";
import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import type { LoginCredentialsErrorFields } from "../../../interfaces/AuthInterface";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginForm: FC = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [errors, setErrors] = useState<LoginCredentialsErrorFields>({})
    const [errorMessage, setErrorMessage] = useState("")

    const { login } = useAuth()
    const navigate = useNavigate()

    const handleLogin = async (e: FormEvent) => {
        try {
            e.preventDefault()
            setIsLoading(true)
            setErrorMessage("")

            await login(username, password)
            navigate('/dashboard')
        } catch (error: any) {
            if (error.response?.status === 401) {
                setErrors({})
                const text = error.response.data?.message
                setErrorMessage(typeof text === "string" ? text : "Login failed.")
            } else if (error.response?.status === 403) {
                setErrors({})
                setErrorMessage(error.response.data?.message ?? "Access denied.")
            } else if (error.response?.status === 422) {
                setErrors(error.response.data.errors ?? {})
            } else {
                console.error("Unexpected error occurred during logging user in:", error)
                setErrorMessage(
                    typeof error?.message === "string" && error.message
                        ? error.message
                        : "Could not reach the server."
                )
            }
        } finally {
            setIsLoading(false)
        }
    };

    return (
        <>
            <form onSubmit={handleLogin} noValidate>
                <div className="mb-4">
                    <FloatingLabelInput
                        label="Username"
                        type="text"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoFocus
                        errors={errors.username}
                    />
                    {/* ✅ show general error under username field */}
                    {errorMessage && (
                        <p className="text-red-400 text-xs mt-1">
                            {errorMessage}
                        </p>
                    )}
                </div>
                <div className="mb-4">
                    <FloatingLabelInput
                        label="Password"
                        type="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        errors={errors.password}
                    />
                </div>
                <SubmitButton className="w-full" label="Sign in" loading={isLoading} loadingLabel="Signing in..." />
            </form>
        </>
    );
};

export default LoginForm;