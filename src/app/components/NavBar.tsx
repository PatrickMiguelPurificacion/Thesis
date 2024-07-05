import { redirect, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export default function NavBar() {
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const router = useRouter();

  const navLinks : string[][] = [
    ['Home', '/home'],
    ['Flashcards', '/flashcard-decks'],
    ['Kanban Board', '/kanban'],
    ['Learn Page', '/learn'],
    ['Notebook', '/notebook'],
  ];

  const getNavLink = (text: string, path: string) => (
    <button
      key={`nav-${path}`}
      onClick={() => router.push(path)}
      className="nav-link hover:bg-blue-500 py-2 px-6 transition duration-300 ease-in-out"
    >
      {text}
    </button>
  );

  // "text-white w-full hover:bg-blue-500 py-2 px-6 transition duration-300 ease-in-out"

  return (
    <div className="flex-none flex-col h-screen text-white w-1/5 overflow-y-auto" style={{ backgroundColor: '#142059' }}>

      <h1 className="text-base text-center my-5 font-bold text-white-700 border-b border-gray-100 pb-4 w-full">
        Navigation
      </h1>
      
      <div className="flex flex-col space-y-4">
        {navLinks.map((val: string[]) => getNavLink(val[0], val[1]))}
      </div>

      {session?.data?.snapshot?.admin && 
        <div className="flex flex-col pt-4 border-t border-gray-700 mt-4 space-y-4">
          {getNavLink('Global Flashcards', '/admin/decks')}
        </div>
      }
      
      <div className="flex flex-col py-4 border-t border-gray-700 mt-4 space-y-4">
        {getNavLink('User Profile', '/user-profile')}

        <button
          onClick={() => signOut()}
          className="nav-link hover:bg-blue-500 py-2 px-6 transition duration-300 ease-in-out"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
