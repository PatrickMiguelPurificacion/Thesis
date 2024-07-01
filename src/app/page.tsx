'use client';

import { useSession } from 'next-auth/react';
import {redirect} from 'next/navigation';

export default function Home() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      if (session) {
        console.log("User is already authenticated. Redirecting to Home page...");
        redirect('/home');
      } else {
        console.log("User Unauthenticated. Redirecting to Sign In page...");
        redirect('/signin');
      }
    },
  });

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      {status === 'loading' && (
        <div className="text-center">
          <h1 className="text-2xl mb-4">Loading...</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
}

Home.requireAuth = true;
