'use client';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { auth, db } from '../firebase';
import { collection, addDoc } from "firebase/firestore";
import { toast } from 'sonner';
import logo from "./../assets/logo.png";

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordAgain, setPasswordAgain] = useState('');
  const [newUser, setUser] = useState({ firstname: '', lastname: '', studentNum: '' });

  const router = useRouter();

  // Add and Authenticate User to the Database
  const signup = async () => {

    // Error Handling
    if (!email.endsWith('@mymail.mapua.edu.ph')) {
      toast.error('Email should be your Mapua Email');
      return;
    }

    if (password !== passwordAgain) {
      toast.error('Passwords do not match');
      return;
    }

    if (newUser.studentNum.length !== 10) {
      toast.error('Student number should be 10 digits');
      return;
    }

    if (password.length < 6) {
      toast.error('Password should be atleast 6 characters long');
      return;
    }

    if (!newUser.firstname || !newUser.lastname || !newUser.studentNum || !email || !password || !passwordAgain) {
      toast.error('All fields are required');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Add user details to Firestore
      
      await addDoc(collection(db, 'users'), {
        firstname: newUser.firstname.trim(),
        lastname: newUser.lastname.trim(),
        studentNum: newUser.studentNum.trim(),
        email: email.trim(),
        uid: user.uid, // adding UID for reference
        admin: false,
      });

      toast.success('Account Successfully Created!');
      // Redirect to sign-in page
      router.push('signin');
    } catch (error: any) {
      console.error('Error creating user:', error.message);
      // Handle error
      toast.error('Error creating account:', error.message);
    }
  };

  return (
    <div className="flex flex-column flex-1 items-center justify-center min-h-full px-6 py-39 bg-gradient-to-t(115deg, (#9F7AEA, #FEE2FE)">
      <div className="grid grid-cols-1 max-w-[768px] sm:grid-cols-2 bg-white rounded-lg shadow-ig overflow-hidden">
        <div
          className="w-full h-[200px] sm:h-full bg-contain bg-[length:auto_100%] sm:bg-[length:65%_auto] bg-center bg-no-repeat mt-6 sm:mt-0"
          style={{
            backgroundImage: `url(${logo.src})`,
          }}
        />
        <div className="py-6 sm:py-16 px-12">
          <h2 className="text-center font-bold leading-9 tracking-tight text-black mb-5 text-2xl">
            Create your Account
          </h2>

          <div className="grid grid-cols-2 gap-5">
            <input
              type="text"
              placeholder="First Name"
              className="border rounded-md border-black py-1 px-2"
              id="firstname"
              name="firstname"
              value={newUser.firstname}
              onChange={(e) => setUser({ ...newUser, firstname: e.target.value })}
              autoComplete="firstname"
              required
            />

            <input
              type="text"
              placeholder="Last Name"
              className="border rounded-md border-black py-1 px-2"
              id="lastname"
              name="lastname"
              value={newUser.lastname}
              onChange={(e) => setUser({ ...newUser, lastname: e.target.value })}
              autoComplete="lastname"
              required
            />
          </div>

          <div className="mt-5">
            <input
              type="email"
              placeholder="Email"
              className="border rounded-md border-black py-1 px-2 w-full"
              id="email"
              name="email"
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mt-5">
            <input
              type="number"
              placeholder="Student Number"
              className="border rounded-md border-black py-1 px-2 w-full"
              id="studentNum"
              name="studentNum"
              value={newUser.studentNum}
              onChange={(e) => setUser({ ...newUser, studentNum: e.target.value })}
              autoComplete="studentNum"
              required
            />
          </div>

          <div className="mt-5">
            <input
              type="password"
              placeholder="Password"
              className="border rounded-md border-black py-1 px-2 w-full"
              id="password"
              name="password"
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mt-5">
            <input
              type="password"
              placeholder="Confirm Password"
              className="border rounded-md border-black py-1 px-2 w-full"
              id="passwordAgain"
              name="passwordAgain"
              autoComplete="current-password"
              onChange={(e) => setPasswordAgain(e.target.value)}
              required
            />
          </div>

          <div className="mt-5">
            <button
              disabled={(!email || !password || !passwordAgain)}
              onClick={async () => { await signup(); }}
              className="disabled:opacity-40 flex w-full justify-center rounded-md bg-violet-800 px-3 py-1.5 text-sm font-semibold leading-6 text-white hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              Sign Up
            </button>

            <button onClick={() => router.push('signin')} className="font-semibold mt-3 text-center leading-6 text-indigo-400 hover:text-indigo-700">
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
