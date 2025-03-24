'use client';

import { useRouter } from 'next/navigation';
import { FaMapMarkedAlt } from 'react-icons/fa'; // Ensure react-icons is installed

export default function Home() {
  const router = useRouter();

  return (
    <main
      className="relative flex h-screen w-full items-center justify-center bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/hero.jpg')" }} // Ensure the image exists in /public
    >
      {/* Darker Overlay */}
      <div className="absolute inset-0 bg-black/73"></div>

      <div className="relative z-10 text-center p-6 max-w-2xl flex flex-col items-center">
        {/* Header (Agrandir + No Line Break) */}
        <p className="text-3xl sm:text-5xl md:text-7xl font-bold font-header text-center mb-4">
          Plan Your Perfect Trip
        </p>

        {/* Subheader (Italicized) */}
        <p className="text-sm sm:text-lg md:text-xl italic font-section text-center px-4">
          Enter your trip details and get optimized routes and logs.
        </p>

        {/* Centered Button with Gradient Background, Icon & Effects */}

        <button
          onClick={() => router.push('/trip-planner')}
          className="flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-lg font-semibold uppercase text-white 
    bg-gradient-to-r from-purple-600 to-blue-500 
    hover:from-purple-700 hover:to-blue-600 active:scale-95 
    transition-all duration-200 ease-in-out rounded-lg shadow-lg w-[90%] sm:w-auto"
        >
          <FaMapMarkedAlt size={30} /> GET STARTED!
        </button>
      </div>
    </main>
  );
}
