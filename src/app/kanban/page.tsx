'use client';
import { signOut, useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import NavBar from '../components/NavBar';

export default function Kanban() {
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const router = useRouter();

  return (
    <div className="flex h-screen"> {/* Set the parent container to flex and full screen height */}
      <NavBar userEmail={session?.data?.user?.email} /> {/*Calls the NavBar component*/}
      
      <div className="flex-grow bg-gray-100 p-8"> {/* Utilize the remaining space and add padding */}
      <p className = "text-black"> This is the KANBAN BOARD</p>      
    </div>
    </div>
  )
}

Kanban.requireAuth = true