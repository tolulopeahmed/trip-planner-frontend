'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';

const LogSheet = () => {
  const router = useRouter();

  interface Stop {
    time: string;
    location: string;
    reason: string;
  }

  interface LogData {
    stops: Stop[];
  }

  const [logData, setLogData] = useState<LogData>({ stops: [] });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const tripResults = localStorage.getItem('logBookData');
    if (tripResults) {
      setLogData(JSON.parse(tripResults));
    }
  }, []);

  useEffect(() => {
    const fetchLogData = async () => {
      try {
        const storedData = localStorage.getItem('logBookData');

        if (storedData) {
          const parsedData = JSON.parse(storedData);
          console.log('Loaded from localStorage:', parsedData);

          // ✅ Ensure stops exist
          if (!Array.isArray(parsedData.stops)) {
            parsedData.stops = [];
          }
          setLogData(parsedData);
        } else {
          console.log('No localStorage data, fetching from API...');
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/trips/latest`
          );

          if (response.status === 200) {
            const fetchedData = response.data;

            // ✅ Ensure stops exist
            if (!Array.isArray(fetchedData.stops)) {
              fetchedData.stops = [];
            }

            console.log('API Data:', fetchedData);
            setLogData(fetchedData);
            localStorage.setItem('logBookData', JSON.stringify(fetchedData));
          }
        }
      } catch (error) {
        console.error('Error fetching log book data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogData();
  }, []);

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

            {/* Dynamic Stop Line Drawing */}
            <div
              className="absolute w-full h-[100px] z-20 grid grid-cols-25"
              style={{ marginLeft: 20 }}
            >
              {logData?.stops.map((stop, index) => {
                if (index === 0) return null; // Skip first stop since there's no previous one

                const prevStop = logData.stops[index - 1];

                const prevHourIndex = prevStop.time
                  ? new Date(prevStop.time).getHours()
                  : 0;
                const currHourIndex = stop.time
                  ? new Date(stop.time).getHours()
                  : 0;

                const prevLeft = index * 40 + 20; // Adjust centering
                const currLeft = (index + 1) * 40 + 20;

                const prevTop = prevHourIndex * 12 + 10;
                const currTop = currHourIndex * 12 + 10;

                return (
                  <React.Fragment key={index}>
                    {/* Horizontal Line */}
                    {prevHourIndex === currHourIndex && (
                      <div
                        className="absolute bg-black z-20"
                        style={{
                          top: `${prevTop}px`,
                          left: `${prevLeft}px`,
                          width: `${currLeft - prevLeft}px`,
                          height: '2px',
                          marginLeft: 20,
                        }}
                      ></div>
                    )}

                    {/* Vertical Line */}
                    {prevHourIndex !== currHourIndex && (
                      <>
                        {/* Vertical segment */}
                        <div
                          className="absolute bg-black z-20"
                          style={{
                            top: `${Math.min(prevTop, currTop)}px`,
                            left: `${prevLeft}px`,
                            width: '2px',
                            height: `${Math.abs(currTop - prevTop)}px`,
                          }}
                        ></div>

                        {/* Horizontal segment after vertical move */}
                        <div
                          className="absolute bg-black z-20"
                          style={{
                            top: `${currTop}px`,
                            left: `${Math.min(prevLeft, currLeft)}px`,
                            width: `${Math.abs(currLeft - prevLeft)}px`,
                            height: '2px',
                          }}
                        ></div>
                      </>
                    )}

                    {/* Stop Indicator */}
                    <div
                      className="absolute bg-red-500 rounded-full w-3 h-3 z-30"
                      style={{
                        top: `${currTop - 1}px`,
                        left: `${currLeft - 1}px`,
                      }}
                      title={`${stop.location} (${stop.reason})`}
                    ></div>

                    {/* LAST STOP: Extend Line to the End */}
                    {index === logData.stops.length - 1 && (
                      <div
                        className="absolute bg-black z-20"
                        style={{
                          top: `${currTop}px`,
                          left: `${currLeft}px`,
                          width: `calc(100% - ${currLeft}px)`,
                          height: '2px',
                        }}
                      ></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Grid Overlay to improve alignment */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="grid grid-cols-25 border-t border-gray-500 opacity-50">
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className="border-r border-gray-400 h-full"></div>
              ))}
            </div>
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
          {/* <div className="h-24 grid grid-rows-1 border border-gray-400">
            <div className="grid grid-cols-25  border-gray-400">
              {Array.from({ length: 24 }).map((_, j) => (
                <div
                  key={j}
                  className="border border-gray-400 p-2 bg-gray-50"
                ></div>
              ))}
            </div>
          </div> */}

          {/* Remarks */}
          {loading ? (
            <div className="text-center text-gray-700 font-bold">
              Loading...
            </div>
          ) : Array.isArray(logData?.stops) && logData.stops.length > 0 ? (
            logData.stops.map((stop: Stop, index: number) => (
              <div
                key={index}
                className="border border-blue-400 p-2 bg-blue-200 text-xs"
              >
                <strong>{stop.time}</strong> - {stop.location} ({stop.reason})
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 font-semibold">
              No stops recorded.
            </div>
          )}

          {logData?.stops?.map((stop, index) => {
            const hourIndex = stop.time ? new Date(stop.time).getHours() : 0;
            return (
              <div
                key={index}
                className="absolute bg-black z-20"
                style={{
                  top: `${hourIndex * 12}px`,
                  left: `${(index + 1) * 40}px`,
                  width: '40px', // Make stop indicator wider
                  height: '4px', // Thick line
                }}
              ></div>
            );
          })}
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
