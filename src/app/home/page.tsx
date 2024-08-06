'use client';

import { signOut, useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import NavBar from '../components/NavBar';
import { FaBook, FaChalkboard, FaBookReader, FaArrowRight } from 'react-icons/fa'; 
import { IoMdCard } from 'react-icons/io'; 
import logo from "./../assets/logo-without-name.png";

interface Summary {
  header: string;
  text: string;
}

interface Feature {
  icon: JSX.Element;
  header: string;
  text: string;
  path: string;
}

export default function Home() {

  // Making sure that user is authenticated. If not, they are redirected to the sign-in page
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const router = useRouter();

  const summaryCards: Summary[] = [
    {
      header: "Review Everyday",
      text: "Make sure to go through your flashcards daily. Check if you have any reviews today.",
    }, {
      header: "Track Deadlines",
      text: "Keep track of your upcoming deadlines to stay on top of your studies.",
    }, {
      header: "Highlight and Keep Notes",
      text: "Learn from the Learn Page and Highlight your learnings. Note what you learned on your notebook.",
    }
  ];

  const featuresCards: Feature[] = [
    {
      icon: (<IoMdCard size={24} className="mx-auto" />),
      header: "Flashcards",
      text: "Review your lessons daily",
      path: "/flashcard-decks",
    }, {
      icon: (<FaChalkboard size={24} className="mx-auto" />),
      header: "Kanban Board",
      text: "Manage and organize your tasks",
      path: "/kanban",
    }, {
      icon: (<FaBookReader size={24} className="mx-auto" />),
      header: "Learn",
      text: "Study your course materials",
      path: "/learn",
    }, {
      icon: (<FaBook size={24} className="mx-auto" />),
      header: "Notebook",
      text: "Add notes on your materials",
      path: "/notebook",
    }
  ];

  return (
    <div className="flex h-screen">
      <NavBar />
      
      <div className="flex-grow overflow-y-auto bg-gray-100 p-8">
        <div className="mb-5">
          <div className="bg-white p-4 shadow-md mb-4 flex flex-col sm:flex-row items-center gap-x-4">
            <img
              className="h-20 w-30"
              src={logo.src}
              alt="SecuSpire logo"
            />
            <div className="w-full">
              <h2 className="text-xl font-semibold mb-2 text-center sm:text-left">
                Secuspire
              </h2>
              <p className="text-center sm:text-left">
                Learn Information Security and Assurance using Spaced Repetition and Other Features
              </p>
            </div>
          </div>
        </div>
      
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {summaryCards.map((summary: Summary, idx: number) => (
            <div key={`summary-card-${idx}`} className="bg-white p-4 shadow-md text-center flex flex-col items-center justify-center">
              <h2 className="text-xl font-semibold mb-2">{summary.header}</h2>
              <p>{summary.text}</p>
            </div>
          ))}
        </div>

        {session.status === "authenticated"
          && !session.data?.snapshot?.admin
          && (
            <>
              <hr className="mt-6 mb-4 border-t-2 border-gray-300" />
              <div>
                <h2 className="text-2xl font-semibold mb-4">Features</h2>
                {/* Four Cards with Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                  {featuresCards.map((feat: Feature, idx: number) => (
                    <div
                      key={`feature-card-${idx}`}
                      className="bg-white px-6 py-10 rounded-md shadow-md text-center flex flex-col items-center justify-items-center"
                    >
                      <div className="mb-2">
                        {feat.icon}
                      </div>
                      <h2 className="text-xl font-semibold mb-2"> 
                        {feat.header}
                      </h2>

                      <p>{feat.text}</p>

                      <button
                        onClick={() => router.push(feat.path)}
                        className="flex mt-3 text-blue-500 items-center gap-x-2"
                      >
                        <FaArrowRight
                          className="mt-1 mr-2 shrink-0"
                        />See {feat.header}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )
        }
      </div>
    </div>
  )
}

Home.requireAuth = true;
