'use client';
import { signOut, useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';

export default function Home() {
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const router = useRouter();

  return (
    <div className="p-8">
      <div className='text-white'>{session?.data?.user?.email }</div>
      <button onClick={() => router.push('home')} className="font-semibold leading-6 text-indigo-600 hover:text-indigo-800">
        Home
      </button>
      <br/>
      <button onClick={() => router.push('user-profile')} className="font-semibold leading-6 text-indigo-600 hover:text-indigo-800">
        User Profile
      </button>
      <br/>
      <button onClick={() => router.push('flashcards')} className="font-semibold leading-6 text-indigo-600 hover:text-indigo-800">
        Flashcards
      </button>
      <br/>
      <button onClick={() => router.push('kanban')} className="font-semibold leading-6 text-indigo-600 hover:text-indigo-800">
        Kanban Board
      </button>
      <br/>
      <button onClick={() => router.push('learn')} className="font-semibold leading-6 text-indigo-600 hover:text-indigo-800">
        Learn Page
      </button>
      <br/>
      <button onClick={() => router.push('notebook')} className="font-semibold leading-6 text-indigo-600 hover:text-indigo-800">
        Notebook
      </button>

      <br/><br/>
      <p className = "text-white"> This is the HOME PAGE</p>
      <br/><br/><br/><br/><br/>
      
      <button className='text-white' onClick={() => signOut()}>Logout</button>
    </div>
  )
}

Home.requireAuth = true