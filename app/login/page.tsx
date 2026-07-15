import LoginForm from "@/components/admin/LoginForm";

export default function LoginPage() {
    return (
        <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4">
            <h1 className="mb-6 font-display text-2xl font-black text-ink">
                Admin Login
            </h1>
            <LoginForm />
        </div>
    );
}