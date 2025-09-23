import { SignIn } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Page() {
  const { userId } = await auth();
  if (userId) redirect('/');

  return (
    <div className="flex h-dvh w-screen items-center justify-center bg-background">
      <SignIn routing="path" path="/login" signUpUrl="/register" />
    </div>
  );
}
