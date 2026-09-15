import { LoginForm } from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="studio-page mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <h1 className="mb-2 font-display text-3xl">Admin sign in</h1>
      <p className="mb-6 text-ink-soft">
        This page is only for the parent or guardian who looks after the studio.
      </p>
      <LoginForm />
    </main>
  );
}
