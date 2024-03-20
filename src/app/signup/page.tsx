'use client';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { auth, db } from '../firebase';
import { collection, addDoc } from "firebase/firestore";

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordAgain, setPasswordAgain] = useState('');
  const [newUser, setUser] = useState({firstname: '', lastname:'', studentNum:'', email:''});

  const router = useRouter();

  //Add and Authenticate User to the Database
  const signup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Add user details to Firestore
      await addDoc(collection(db, 'users'), {
        firstname: newUser.firstname.trim(),
        lastname: newUser.lastname.trim(),
        studentNum: newUser.studentNum.trim(),
        email: newUser.email.trim(),
        uid: user.uid // adding UID for reference
      });
  
      // Redirect to sign-in page
      router.push('signin');
    } catch (error:any) {
      console.error('Error creating user:', error.message);
      // Handle error
    }
  };
  
  
  return (
    <>
    <div className="flex min-h-full flex-1 flex-col justify-center items-center px-6 py-12 lg:px-8">
    <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg px-40 py-6 max-w-md">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            className="mx-auto h-10 w-auto"
            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
            alt="Your Company"
          />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-black">
            Sign up
          </h2>
        </div>

      
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          
        <div className="space-y-6">
            <div>
              <label htmlFor="firstname" className="block text-sm font-medium leading-6 text-black">
                First Name
              </label>
              <div className="mt-2">
                <input
                  id="firstname"
                  name="firstname"
                  type="text"
                  value={newUser.firstname}
                  onChange={(e) => setUser({...newUser, firstname: e.target.value})}
                  autoComplete="firstname"
                  required
                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-black shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            

            <div className="space-y-6">
            <div>
              <label htmlFor="lastname" className="block text-sm font-medium leading-6 text-black">
                Last Name
              </label>
              <div className="mt-2">
                <input
                  id="lastname"
                  name="lastname"
                  type="text"
                  value={newUser.lastname}
                  onChange={(e) => setUser({...newUser, lastname: e.target.value})}
                  autoComplete="lastname"
                  required
                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-black shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="space-y-6">
            <div>
              <label htmlFor="studentNum" className="block text-sm font-medium leading-6 text-black">
                Student Number
              </label>
              <div className="mt-2">
                <input
                  id="studentNum"
                  name="studentNum"
                  type="number"
                  value={newUser.studentNum}
                  onChange={(e) => setUser({...newUser, studentNum: e.target.value})}
                  autoComplete="studentNum"
                  required
                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-black shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-black">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={newUser.email}
                  autoComplete="email"
                  onChange={(e) => {setEmail(e.target.value); setUser({...newUser, email: e.target.value})}}
                  required
                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-black shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-black">
                  Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-black shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-black">
                  Password Again
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="passwordAgain"
                  name="passwordAgain"
                  type="password"
                  autoComplete="current-password"
                  onChange={(e) => setPasswordAgain(e.target.value)}
                  required
                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-black shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                disabled={(!email || !password || !passwordAgain) || (password !== passwordAgain)}
                onClick={async () => {await signup(); router.push('signin')}}
                className="disabled:opacity-40 flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-black shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Sign Up
              </button>
              
              <button onClick={() => router.push('signin')} className="font-semibold mt-3 text-center leading-6 text-indigo-400 hover:text-indigo-300">
              Back
            </button>
            </div>
          </div>
        </div>
      </div>
      </div>
      </div>
      </div>
      </div>
    </>
  )
}
