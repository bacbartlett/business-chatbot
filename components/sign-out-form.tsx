'use client';

import Form from 'next/form';
import { useClerk } from '@clerk/nextjs';

export const SignOutForm = () => {
  const { signOut } = useClerk();
  return (
    <Form
      className="w-full"
      action={async () => {
        'use server';
        signOut({ redirectUrl: '/' });
      }}
    >
      <button
        type="submit"
        className="w-full text-left px-1 py-0.5 text-red-500"
      >
        Sign out
      </button>
    </Form>
  );
};
