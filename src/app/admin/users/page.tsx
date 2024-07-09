'use client';

import NavBar from '@/app/components/NavBar';
import { fetchAllUsers } from '@/app/services/AllUsersService';
import { Timestamp } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UserDetails {
  firstname: string;
  lastname: string;
  studentNum: number;
  email: string;
  uid: string;
  admin: boolean;
  lastActive: Date;
  recentActiveDays: Date[];
}

export default function Decks() {
  //Ensures user is in session
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const [allUsers, setAllUsers] = useState<UserDetails[]>([]);
  const [userNum, setUserNum] = useState(null);

  // if (!session?.data?.snapshot?.admin)
  //   return redirect('/home');

  const formatDate = (timestamp: Timestamp | null): string => {
    if (timestamp == null)
      return 'no record';

    let d = new Date(timestamp?.seconds * 1000);
    return d.toString();
  }

  const formatActiveDays = (dates: Timestamp[] | null): string => {
    if (dates == null)
      return 'no record';

    let strs: string[] = [];
    for (let i = 0; i < dates.length; i++) {
      let d = new Date(dates[i].seconds * 1000);
      strs.push(`${d.getFullYear()}-${d.getMonth().toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`);
    }

    return strs.join(', ');
  }

  useEffect(() => {
    (async () => {
      const users = await fetchAllUsers();
      setAllUsers(users);
      setUserNum(users.length);
    })();
  }, [session]);

  return (
    <div className="flex h-screen bg-gray-100">
      <NavBar />

      <div className="flex-grow overflow-y-auto p-8">
        <header className="text-white py-6 px-8 mb-2" style={{ backgroundColor: '#142059' }}>
          <h1 className="text-2xl font-semibold text-center">All Users</h1>
          <h2 className="text-xl font-semibold text-center">{userNum} Total Users</h2>
        </header>

        {allUsers.map((user: UserDetails, idx: number) => (
          <div
            className="bg-white p-4 mb-4"
          >
            <p>
              <strong>{user.firstname} {user.lastname}</strong> ({user.email})
            </p>
            <p>
              <strong>Last active: </strong> {formatDate(user.lastActive)}
            </p>
            <p>
              <strong>Recent active days: </strong> {formatActiveDays(user.recentActiveDays)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

Decks.requireAuth = true;
