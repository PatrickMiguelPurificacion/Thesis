'use client';

import { useSession } from "next-auth/react";
import { redirect, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

const ReviewingPage = () => {
    const router = useRouter();
    const session = useSession({
      required: true,
      onUnauthenticated() {
        redirect('/signin');
      },
    });
  
    const searchParams = useSearchParams();
    const reviewDeckID = searchParams ? searchParams.get('deckId') : null; // For getting the ID of the deck from the passed url

    return(
        <div className="text-white">This is the Reviewing Page for {reviewDeckID}</div>
    );

};

export default ReviewingPage;