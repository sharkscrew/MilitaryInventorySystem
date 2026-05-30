import AuthPageLayout from "./AuthPageLayout";
import LoginForm from "./components/LoginForm";

function LoginPage() {
    return (
        <AuthPageLayout>
            <LoginForm />
        </AuthPageLayout>
    );
}

export default LoginPage;