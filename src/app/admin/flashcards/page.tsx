"use client";

import NavBar from "@/app/components/NavBar";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function AdminFlashcards() {
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  return (
    <div className="flex h-screen">
      <NavBar />

      <div className="flex-grow overflow-y-auto bg-gray-100 p-8">
        TODO
      </div>
    </div>
  )
}

AdminFlashcards.requireAuth = true;
