import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="flex h-dvh w-screen items-center justify-center bg-background">
      <SignUp routing="path" path="/register" signInUrl="/login" />
    </div>
  );
}
