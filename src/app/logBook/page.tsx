'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';

const LogSheet = () => {
  const router = useRouter();

  return (
    <main
      className="flex items-center justify-center min-h-screen bg-gray-900 text-black p-6 bg-cover bg-center relative"
      style={{ backgroundImage: 'url(/hero.jpg)' }}
    >
      <div className="absolute inset-0 bg-black/80"></div>

      <div className="w-[90%] max-w-7xl h-auto flex flex-col bg-white shadow-lg rounded-lg overflow-hidden relative z-10 p-6">
        {/* Top Section */}
        <button
          onClick={() => router.push('/trip-planner')}
          className="flex items-center gap-2 text-gray-700 hover:text-black mb-4"
        >
          <FaArrowLeft size={20} />
          <span>Back</span>
        </button>

        {/* Main Title */}
        <div className="flex justify-center items-center border-b pb-3 border-blue-500">
          <div className="text-4xl font-bold">DRIVER&apos;S DAILY LOG</div>
        </div>

        <div className="grid grid-cols-3 text-sm font-bold text-gray-700 mb-4">
          <div>Total Driving Miles: 427</div>
          <div className="text-center">Total Truck Mileage: 427</div>
          <div className="text-right">
            <span>Month: 06</span> | <span>Day: 04</span> |{' '}
            <span>Year: 2024</span>
          </div>
        </div>

        {/* Co-Driver and Company Info */}
        <div className="grid grid-cols-2 border-b pb-2 text-sm text-gray-700">
          <div>
            <div>
              <span className="font-bold">Driver Number:</span> 1224213
            </div>
            <div>
              <span className="font-bold">Initials:</span> YS
            </div>
          </div>
          <div className="text-right">
            <div>
              <span className="font-bold">Company:</span> Schneider National
              Carriers, Inc.
            </div>
            <div>
              <span className="font-bold">Location:</span> Green Bay, WI
            </div>
          </div>
        </div>

        {/* Duty Status Grid */}
        <div className="mt-6 border-t border-b py-4 bg-blue-50 text-gray-900">
          <div className="font-bold text-center text-lg">DUTY STATUS GRID</div>
          <div
            className="grid grid-cols-25 mt-2 text-xs text-center"
            style={{ marginLeft: 30 }}
          >
            {[
              'Midnight',
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              '12 Noon',
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
            ].map((label, i) => (
              <div key={i} className="font-bold">
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-rows-4 border border-blue-400">
            {['Off Duty', 'Sleeper Berth', 'Driving', 'On Duty'].map(
              (status, i) => (
                <div
                  key={i}
                  className="grid grid-cols-25 border border-blue-400"
                >
                  <div className="border p-1 font-bold text-xs bg-blue-200 text-gray-900">
                    {status}
                  </div>
                  {Array.from({ length: 24 }).map((_, j) => (
                    <div
                      key={j}
                      className="border border-blue-400 p-2 bg-blue-100"
                    ></div>
                  ))}
                </div>
              )
            )}
          </div>
          <div
            className="grid grid-cols-25 mt-2 text-xs text-center"
            style={{ marginLeft: 30 }}
          >
            {[
              'Midnight',
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              '12 Noon',
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
            ].map((label, i) => (
              <div key={i} className="font-bold">
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Remarks Section */}
        <div className="border-b py-3" style={{ marginTop: -8 }}>
          <span
            className="font-bold text-gray-700"
            style={{ marginBottom: -8, marginTop: -8 }}
          >
            REMARKS:
          </span>
          <div className="grid grid-cols-25 text-xs text-center">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className="border border-gray-400 p-1"></div>
            ))}
          </div>
          <div className="h-24 grid grid-rows-1 border border-gray-400">
            <div className="grid grid-cols-25  border-gray-400">
              {Array.from({ length: 24 }).map((_, j) => (
                <div
                  key={j}
                  className="border border-gray-400 p-2 bg-gray-50"
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Shipper and Load Info */}
        <div className="grid grid-cols-2 border-b pb-2 mt-4 text-sm text-gray-700">
          <div>
            <div>
              <span className="font-bold">Shipper:</span> Don’s Paper Co.
            </div>
            <div>
              <span className="font-bold">Commodity:</span> Paper Products
            </div>
          </div>
          <div className="text-right">
            <div>
              <span className="font-bold">Load No.:</span> ST13241564114
            </div>
          </div>
        </div>

        {/* Additional Instructions */}
        <div className="border-b py-3 mt-6">
          <span className="font-bold text-gray-700">
            ADDITIONAL INSTRUCTIONS:
          </span>
          <div className="border h-16 border-blue-400 bg-gray-100"></div>
        </div>
      </div>
    </main>
  );
};

export default LogSheet;
