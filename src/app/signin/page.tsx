'use client';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import logo from "./../assets/logo.png";
import { toast } from 'sonner';

export default function Signin() {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      const login = await signIn('credentials', { email, password, redirect: false });

      if(login?.ok){
        router.push('/home');
      }

      else{
        toast.error('Invalid email or password');
      }

    } catch (error: any) {
      console.error('Sign in error:', error.message);
    }
  };

  //SignIn uses next-auth from react, but authentication is firebase
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center items-center px-6 py-12">
      <div className="bg-white shadow-md rounded-lg px-6 sm:px-20 py-6 max-w-md">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            src={logo.src}
            alt="SecuSpire logo"
            className="mx-auto h-40 w-50"
          />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-black">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
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
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full rounded-md border-black bg-gray/5 py-1.5 text-black shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-x-4">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-black">
                  Password
                </label>
                <div className="text-sm">
                  <div onClick={() => router.push('/forgot-password')} className="cursor-pointer font-semibold text-indigo-600 hover:text-indigo-800">
                    Forgot password?
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full rounded-md border-black bg-white/5 py-1.5 text-black shadow-sm ring-1 ring-inset ring-black/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                onClick={handleSignIn}
                disabled={!email || !password}
                className="disabled:opacity-40 flex w-full justify-center rounded-md bg-violet-800 px-3 py-1.5 text-sm font-semibold leading-6 text-white hover:bg-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
              >
                Sign in
              </button>
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-black">
            Not a member?{' '}
            <button onClick={() => router.push('signup')} className="font-semibold leading-6 text-indigo-600 hover:text-indigo-800">
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
