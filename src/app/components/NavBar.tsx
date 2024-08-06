import { redirect, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { FaBars } from 'react-icons/fa';

export default function NavBar() {
  const [navOpen, setNavOpen] = useState(false);

  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const router = useRouter();

  const getNavLink = (text: string, path: string) => (
    <button
      key={`nav-${path}`}
      onClick={() => router.push(path)}
      className="nav-link hover:bg-blue-500 py-2 px-6 transition duration-300 ease-in-out"
    >
      {text}
    </button>
  );

  return (
    <nav className={`${navOpen ? 'w-fit' : 'w-[80px]'} sm:w-1/5 flex-none flex-col h-screen text-white overflow-y-auto transition duration-300 ease-in-out`} style={{ backgroundColor: '#142059' }}>
      <div className="border-b border-gray-100 py-5">
        <FaBars
          size="24"
          className="block sm:hidden mx-auto cursor-pointer"
          onClick={() => setNavOpen(val => !val)}
        />

        <h1 className="hidden sm:block text-base text-center font-bold text-white-700 w-full">
          Navigation
        </h1>
      </div>

      {session.status === "authenticated" && (
        <>
          {session?.data?.snapshot?.admin
            ? (
              <div className={`${navOpen ? 'flex' : 'hidden'} sm:flex flex-col gap-y-4 items-stretch py-4 border-t border-gray-700`}>
                {getNavLink('Home', '/home')}
                {getNavLink('Global Flashcards', '/admin/decks')}
                {getNavLink('All Users', '/admin/users')}
              </div>
            ) : (
              <>
                <div className={`${navOpen ? 'flex' : 'hidden'} sm:flex flex-col gap-y-4 items-stretch py-4`}>
                  {getNavLink('Home', '/home')}
                  {getNavLink('Flashcards', '/flashcard-decks')}
                  {getNavLink('Kanban Board', '/kanban')}
                  {getNavLink('Learn Page', '/learn')}
                  {getNavLink('Notebook', '/notebook')}
                </div>
              </>
            )
          }

          <div className={`${navOpen ? 'flex' : 'hidden'} sm:flex flex-col gap-y-4 items-stretch py-4 border-t border-gray-700`}>
            {!session?.data?.snapshot?.admin && getNavLink('User Profile', '/user-profile')}

            <button
              onClick={() => signOut()}
              className="nav-link hover:bg-blue-500 py-2 px-6 transition duration-300 ease-in-out"
            >
              Sign Out
            </button>
          </div>
        </>
      )}
      
    </nav>
  );
}
