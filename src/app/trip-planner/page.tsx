'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaMapMarkerAlt,
  FaClock,
  FaRoad,
  FaTruck,
  FaArrowLeft,
  FaSpinner,
  FaSyncAlt,
  FaCheckCircle,
} from 'react-icons/fa';
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';
import locations from './Locations';
import axios from 'axios';
import { Polyline } from '@react-google-maps/api';

const MAP_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!; // Ensure this is set in your .env file

interface TripResult {
  pickup_location: string;
  dropoff_location: string;
  current_cycle_hours: number;
  estimated_distance: number;
  estimated_time: number;
}

export default function TripPlanner() {
  const router = useRouter();

  const [tripDetails, setTripDetails] = useState({
    currentLocation: '',
    pickupLocation: '',
    dropoffLocation: '',
    cycleHours: '',
  });

  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<
    Record<string, boolean>
  >({});
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [tripResults, setTripResults] = useState<TripResult | null>(null);
  const LIBRARIES: ('places' | 'geometry' | 'drawing' | 'visualization')[] = [
    'geometry',
  ];

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: MAP_API_KEY,
    libraries: LIBRARIES, // Use the constant here
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTripDetails({ ...tripDetails, [name]: value });

    if (
      ['currentLocation', 'pickupLocation', 'dropoffLocation'].includes(name)
    ) {
      const filtered = locations.filter((loc) =>
        loc.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setFocusedField(name);
      setSelectedLocations({ ...selectedLocations, [name]: false });
    }
  };

  const handleSelect = (name: string, value: string) => {
    setTripDetails({ ...tripDetails, [name]: value });
    setSuggestions([]);
    setFocusedField(null);
    setSelectedLocations({ ...selectedLocations, [name]: true });
  };

  const isFormValid = Object.values(tripDetails).every(
    (val) => val.trim() !== ''
  );
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);

    const formattedTripDetails = {
      current_location: tripDetails.currentLocation,
      pickup_location: tripDetails.pickupLocation,
      dropoff_location: tripDetails.dropoffLocation,
      current_cycle_hours: Number(tripDetails.cycleHours), // Match Django field name
    };

    console.log('Submitting Trip:', formattedTripDetails);

    try {
      const response = await axios.post(
        `https://trip-planner-app-n295.onrender.com/api/trips/`,
        formattedTripDetails,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 201) {
        console.log('Trip saved:', response.data);
        setTripResults(response.data);

        // New Google Maps Routes API
        try {
          const response = await axios.post(
            `https://routes.googleapis.com/directions/v2:computeRoutes`,
            {
              origin: {
                location: {
                  latLng: {
                    latitude: 33.5186, // Replace with actual lat/lng from geocoding API
                    longitude: -86.8104, // Replace with actual lat/lng
                  },
                },
              },
              destination: {
                location: {
                  latLng: {
                    latitude: 32.3668, // Replace with actual lat/lng
                    longitude: -86.3, // Replace with actual lat/lng
                  },
                },
              },
              travelMode: 'DRIVE',
              routingPreference: 'TRAFFIC_AWARE_OPTIMAL',
              computeAlternativeRoutes: false,
              languageCode: 'en-US',
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': MAP_API_KEY,
                'X-Goog-FieldMask':
                  'routes.duration.seconds,routes.distanceMeters,routes.polyline',
              },
            }
          );

          if (response.data.routes && response.data.routes.length > 0) {
            const route = response.data.routes[0];
            console.log('Route API Response:', response.data);

            setTripResults({
              pickup_location: tripDetails.pickupLocation,
              dropoff_location: tripDetails.dropoffLocation,
              current_cycle_hours: Number(tripDetails.cycleHours),
              estimated_distance: parseFloat(
                (route.distanceMeters / 1000).toFixed(2)
              ),
              estimated_time: Math.round(
                Number(route.duration.replace('s', '')) / 60
              ),
            });

            // Convert encoded polyline to Google Maps polyline
            if (
              window.google &&
              window.google.maps &&
              window.google.maps.geometry &&
              route.polyline?.encodedPolyline
            ) {
              const decodedPolyline =
                window.google.maps.geometry.encoding.decodePath(
                  route.polyline.encodedPolyline
                );

              if (
                Array.isArray(decodedPolyline) &&
                decodedPolyline.length > 0
              ) {
                setDirections({
                  request: {
                    origin: new google.maps.LatLng(33.5186, -86.8104),
                    destination: new google.maps.LatLng(32.3668, -86.3),
                    travelMode: google.maps.TravelMode.DRIVING,
                  },
                  routes: [
                    {
                      overview_path: decodedPolyline.map(
                        (latLng) =>
                          new google.maps.LatLng(latLng.lat(), latLng.lng())
                      ),
                      overview_polyline: route.polyline.encodedPolyline, // FIXED
                      bounds: new google.maps.LatLngBounds(),
                      copyrights: '',
                      legs: [],
                      warnings: [],
                      waypoint_order: [],
                      summary: `${tripDetails.pickupLocation} to ${tripDetails.dropoffLocation}`,
                    },
                  ],
                } as google.maps.DirectionsResult);
              } else {
                console.error(
                  'Decoded polyline is empty or invalid:',
                  decodedPolyline
                );
              }
            } else {
              console.error(
                'Google Maps Geometry library is not loaded or polyline is missing.'
              );
            }
          } else {
            console.error('No routes found.');
          }
        } catch (error) {
          console.error('Error fetching route:', error);
        }
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          'Error submitting trip:',
          error.response?.data || error.message
        );
      } else {
        console.error('Unexpected error:', error);
      }
    }

    setLoading(false);
  };

  return (
    <main
      className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-6 bg-cover bg-center relative"
      style={{ backgroundImage: 'url(/hero.jpg)' }}
    >
      <div className="absolute inset-0 bg-black/80"></div>

      <div className="w-full max-w-7xl h-auto flex flex-col md:flex-row bg-gray-800 shadow-lg rounded-lg overflow-hidden relative z-10">
        {/* Left Section: Form */}
        <div className="w-full md:w-5/12 p-8 flex flex-col">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-300 hover:text-white mb-6"
          >
            <FaArrowLeft size={20} />
            <span>Back</span>
          </button>

          <p className="text-3xl text-center font-bold mt-1">Plan Your Trip</p>
          <p className="text-gray-400 italic text-center mb-6">
            Enter your trip details to generate the best route.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 flex-grow">
              {[
                {
                  name: 'currentLocation',
                  icon: <FaMapMarkerAlt />,
                  placeholder: 'Current Location',
                },
                {
                  name: 'pickupLocation',
                  icon: <FaTruck />,
                  placeholder: 'Pickup Location',
                },
                {
                  name: 'dropoffLocation',
                  icon: <FaRoad />,
                  placeholder: 'Dropoff Location',
                },
                {
                  name: 'cycleHours',
                  icon: <FaClock />,
                  placeholder: 'Current Cycle (Hrs)',
                  type: 'number',
                },
              ].map(({ name, icon, placeholder, type = 'text' }) => (
                <div key={name} className="relative">
                  <div className="flex items-center border-b-2 border-gray-500 py-2">
                    <span className="text-primary mr-3">{icon}</span>
                    <input
                      type={type}
                      name={name}
                      placeholder={placeholder}
                      value={tripDetails[name as keyof typeof tripDetails]}
                      onChange={handleChange}
                      onFocus={() => setFocusedField(name)}
                      className="w-full outline-none bg-transparent text-white placeholder-gray-400"
                      required
                    />
                    {selectedLocations[name] && (
                      <FaCheckCircle
                        className="text-green-500 ml-2"
                        size={20}
                      />
                    )}
                  </div>
                  {focusedField === name && suggestions.length > 0 && (
                    <ul className="absolute left-0 w-full bg-gray-700 text-white shadow-lg rounded-md mt-1 z-10 max-h-40 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <li
                          key={`${suggestion}-${index}`}
                          onClick={() => handleSelect(name, suggestion)}
                          className="p-2 cursor-pointer hover:bg-gray-600"
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-10">
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className={`flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold uppercase rounded-lg shadow-lg transition-all duration-200 ease-in-out ${
                  isFormValid
                    ? 'text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 active:scale-95'
                    : 'text-gray-400 bg-gray-600'
                } ${loading ? 'cursor-wait bg-gray-500' : ''}`}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin text-white" size={24} />{' '}
                    Generating...
                  </>
                ) : (
                  <>
                    <FaSyncAlt size={22} /> Generate Route
                  </>
                )}
              </button>
            </div>

            {tripResults && (
              <div className="mt-6 bg-gray-600 p-4 rounded-lg text-white shadow-md">
                <h2 className="text-center font-bold text-xs mb-2 text-primary ">
                  YOUR TRIP DETAILS
                </h2>
                <div className="mb-4">
                  <h2
                    className="text-xs text-gray-400 uppercase"
                    style={{ marginBottom: -7 }}
                  >
                    Routes
                  </h2>
                  <p className="text-3xl font-bold mt-1">
                    {tripResults.pickup_location}{' '}
                    <span className="text-primary font-extrabold text-3xl">
                      →
                    </span>{' '}
                    {tripResults.dropoff_location}
                  </p>
                </div>

                <div className="mb-4">
                  <h2
                    className="text-xs text-gray-400 uppercase"
                    style={{ marginBottom: -7 }}
                  >
                    Cycle Hours
                  </h2>
                  <p className="text-3xl font-bold mt-1">
                    {tripResults.current_cycle_hours}{' '}
                    <span className="text-lg">hours</span>
                  </p>
                </div>

                <div className="mb-4">
                  <h2
                    className="text-xs text-gray-400 uppercase"
                    style={{ marginBottom: -7 }}
                  >
                    Estimated Distance
                  </h2>
                  <p className="text-3xl font-bold mt-1">
                    {tripResults.estimated_distance}{' '}
                    <span className="text-lg">km</span>
                  </p>
                </div>

                <div className="mb-4">
                  <h2
                    className="text-xs text-gray-400 uppercase"
                    style={{ marginBottom: -7 }}
                  >
                    Estimated Duration
                  </h2>
                  <p className="text-3xl font-bold mt-1">
                    {tripResults.estimated_time}{' '}
                    <span className="text-lg">mins</span>
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Right Section: Map */}
        <div className="w-full md:w-7/12 h-[85vh]">
          {isLoaded ? (
            <GoogleMap
              center={{ lat: 33.5186, lng: -86.8104 }} // Default center
              zoom={10}
              mapContainerStyle={{ width: '100%', height: '100%' }}
            >
              {selectedLocations.pickupLocation && (
                <Marker position={{ lat: 33.5186, lng: -86.8104 }} />
              )}
              {selectedLocations.dropoffLocation && (
                <Marker position={{ lat: 32.3668, lng: -86.3 }} />
              )}

              {/* Add the Polyline if directions are available */}
              {directions && (
                <Polyline
                  path={directions.routes[0].overview_path} // Ensure the decoded path is passed
                  options={{
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.8,
                    strokeWeight: 4,
                  }}
                />
              )}
            </GoogleMap>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Loading Map...
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
