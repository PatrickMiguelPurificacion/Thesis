'use client';
import React from 'react';
import NavBar from '../components/NavBar';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';


  interface SectionProps {
    title: string;
    steps: string[];
  }

const Section: React.FC<SectionProps> = ({ title, steps }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-2xl font-semibold mb-4">{title}</h2>
    <ul className="list-disc list-inside space-y-2">
      {steps.map((step, index) => (
        <li key={index} className="text-gray-700">{step}</li>
      ))}
    </ul>
  </div>
);
const Manual = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NavBar userEmail={undefined} />

      <div className="flex-grow container mx-auto p-6">
        <h1 className="text-4xl font-bold text-center mb-8">SecuSpire Manual</h1>

        <div className="space-y-12">
          <Section
            title="Creating and Signing Up"
            steps={[
              "First, go to create account and fill up the necessary information before signing in with the system.",
              "After creating an account, the user will now be redirected to the home page of SecuSpire.",
            ]}
          />

          <Section
            title="SecuSpire Dashboard"
            steps={[
              "After logging in, the user will see the different features of the system using SecuSpire such as Learn, Kanban Board, Flashcards, Notebook, FAQ, and Feedback.",
              "On the left side, the users will be able to see when they will review and also the different tasks with their deadlines.",
            ]}
          />

          <Section
            title="FlashCards"
            steps={[
              "When going to the flashcards feature, users can see the different decks wherein they will have the option to create a new version and also add their own set of flashcards.",
              "Users can also choose the review mode which is a feature in which they can create their own flashcards, study and cram or answer the set of questions related to the current topic.",
              "In creating a new set of flashcards, users will fill up a form which contains a question, answer and the deck number which will be displayed in the flashcards home page.",
              "For the cramming feature, users can review the learning materials provided in the learn page and try to answer the set of questions provided here.",
              "For the repetition mode, users have the option to choose the difficulty level: easy, good, hard, and again, with each of them having their own time limit.",
            ]}
          />

          <Section
            title="Kanban Board"
            steps={[
              "Users can see the to-do list, progress, and completed tasks assigned to them while reviewing the learning materials and answering the set of flashcards.",
              "Users can also add a task and set their own deadline in order to accomplish it and not forget.",
            ]}
          />

          <Section
            title="Notebook"
            steps={[
              "Users can add notes while reviewing the lecture materials in the learn page. They can add details and summarize important notes with this feature in order to better remember the terms related to the topic.",
            ]}
          />

          <Section
            title="Learn Page"
            steps={[
              "Users can review the different lecture materials here and have the option to add, remove, take note, and highlight important terms or phrases.",
              "Users can add a note which creates a title and details which will be saved for helping them review later in the future.",
              "For the add feature in the learn page, users can add notes and direct them to the category to which they belong depending on the parts of the topic.",
            ]}
          />

          <Section
            title="Frequently Asked Questions"
            steps={[
              "Users can see the most frequently asked questions about how the system works on this page.",
            ]}
          />

          <Section
            title="Feedback Page"
            steps={[
              "Users can fill up a form and give feedback for further improvement of the system.",
            ]}
          />

          <Section
            title="User Profile"
            steps={[
              "Users can change their profile information and password using this feature.",
            ]}
          />
        </div>
      </div>
    </div>
  );
};



export default Manual;

    