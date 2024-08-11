'use client';

import NavBar from '@/app/components/NavBar';
import { fetchAllUsers } from '@/app/services/AllUsersService';
import { UserDetails } from '@/types/user-details';
import { Timestamp } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Decks() {
  //Ensures user is in session
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const [allUsers, setAllUsers] = useState<UserDetails[]>([]);
  const [userNum, setUserNum] = useState(Number);

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
      const users: UserDetails[] = await fetchAllUsers();
      setAllUsers(users);
      setUserNum(users.length);
    })();
  }, [session]);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const usersFilter = (user: UserDetails) => {
    const dates = ((user.recentActiveDays ?? []) as Timestamp[]).map((value) => value.seconds * 1000);

    const _from = from ? new Date(from).getTime() : undefined;
    const __to = to ? new Date(to) : undefined;
    const _to = to ? __to?.setDate(__to.getDate() + 1) : undefined;

    return (
      (from ? dates.filter(date => date >= _from!).length > 0 : true) &&
      (to ? dates.filter(date => date < _to!).length > 0 : true)
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <NavBar />

      <div className="flex-grow overflow-y-auto p-8">
        <header className="text-white py-6 px-8 mb-4" style={{ backgroundColor: '#142059' }}>
          <h1 className="text-2xl font-semibold text-center">All Users</h1>
          <h2 className="text-xl font-semibold text-center">{userNum} Total Users</h2>
        </header>

        <div className="flex flex-row gap-6 mb-4 items-center">
          <div className="flex flex-row gap-2 items-center">
            <p className="font-bold">From:</p>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom((e.target as HTMLInputElement).value)}
            />
          </div>

          <div className="flex flex-row gap-2 items-center">
            <p className="font-bold">To:</p>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo((e.target as HTMLInputElement).value)}
            />
          </div>

          <p>Found {allUsers.filter(usersFilter).length} out of {allUsers.length} users</p>
        </div>

        {allUsers.filter(usersFilter).map((user: UserDetails, idx: number) => (
          <div
            className="bg-white p-4 mb-4"
            key={`user-${idx}`}
          >
            <p>
              <strong>{user.firstname} {user.lastname}</strong> ({user.email})
            </p>
            <p>
              <strong>Last active: </strong> {formatDate(user.lastActive as Timestamp)}
            </p>
            <p>
              <strong>Recent active days: </strong> {formatActiveDays(user.recentActiveDays as Timestamp[])}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

Decks.requireAuth = true;
