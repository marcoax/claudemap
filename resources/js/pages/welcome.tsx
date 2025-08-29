import { useState, useCallback, useEffect } from 'react';
import { Head, router, Link, usePage } from '@inertiajs/react';
import GoogleMap from '@/components/google-map';
import TopBar from '@/components/top-bar';
import LocationsSidebar from '@/components/locations-sidebar';
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { type Location } from '@/types/location';

interface WelcomeProps extends SharedData {
    locations: Location[];
    total_count: number;
    filtered_count: number;
    filters: {
        search?: string;
        stato?: string;
    };
}

export default function Welcome() {
    const { auth, locations: initialLocations, total_count, filtered_count, filters = {} } = usePage<WelcomeProps>().props;
    const [locations, setLocations] = useState<Location[]>(initialLocations);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [currentFilter, setCurrentFilter] = useState(filters.stato || 'tutti');
    const [totalCount, setTotalCount] = useState(total_count);
    const [filteredCount, setFilteredCount] = useState(filtered_count);
    const [isLoading, setIsLoading] = useState(false);

    const updateLocations = useCallback(async (search?: string, stato?: string) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (stato && stato !== 'tutti') params.append('stato', stato);

            const response = await fetch(`/?${params.toString()}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setLocations(data.locations);
                setTotalCount(data.total_count);
                setFilteredCount(data.filtered_count);
            }
        } catch (error) {
            console.error('Errore aggiornamento locations:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        setSelectedLocation(null); // Clear selection when searching
        updateLocations(query, currentFilter);

        router.get('/', {
            search: query || undefined,
            stato: currentFilter !== 'tutti' ? currentFilter : undefined
        }, {
            preserveState: true,
            replace: true,
        });
    }, [currentFilter, updateLocations]);

    const handleFilterChange = useCallback((filter: string) => {
        setCurrentFilter(filter);
        setSelectedLocation(null); // Clear selection when filtering
        updateLocations(searchQuery, filter);

        router.get('/', {
            search: searchQuery || undefined,
            stato: filter !== 'tutti' ? filter : undefined
        }, {
            preserveState: true,
            replace: true,
        });
    }, [searchQuery, updateLocations]);

    const handleReset = useCallback(() => {
        setSearchQuery('');
        setCurrentFilter('tutti');
        setSelectedLocation(null);

        if (mapInstance) {
            const bounds = new google.maps.LatLngBounds();
            locations.forEach(location => {
                bounds.extend({
                    lat: Number(location.latitude),
                    lng: Number(location.longitude)
                });
            });
            mapInstance.fitBounds(bounds);
        }

        router.get('/', {}, {
            preserveState: true,
            replace: true,
        });

        updateLocations('', 'tutti');
    }, [mapInstance, locations, updateLocations]);

    const handleLocationSelect = useCallback((location: Location) => {
        setSelectedLocation(location);
    }, []);

    const handleMapReady = useCallback((map: google.maps.Map) => {
        setMapInstance(map);
    }, []);

    const toggleSidebar = useCallback(() => {
        setSidebarOpen(prev => !prev);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            <Head title="Locations Map">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-950">
                {/* Header Navigation */}
                <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-12">
                            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Locations Map
                            </h1>
                            <nav className="flex items-center space-x-4">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="inline-block rounded-sm border border-gray-300 px-4 py-1.5 text-sm leading-normal text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="inline-block rounded-sm border border-transparent px-4 py-1.5 text-sm leading-normal text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:border-gray-600"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={register()}
                                            className="inline-block rounded-sm border border-gray-300 px-4 py-1.5 text-sm leading-normal text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Top Bar */}
                <TopBar
                    locations={locations}
                    onSearch={handleSearch}
                    onFilterChange={handleFilterChange}
                    onReset={handleReset}
                    onToggleSidebar={toggleSidebar}
                    currentFilter={currentFilter}
                    searchQuery={searchQuery}
                    totalCount={totalCount}
                    filteredCount={filteredCount}
                    sidebarOpen={sidebarOpen}
                />

                {/* Main Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Map Container */}
                    <div className="flex-1 relative">
                        {isLoading && (
                            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                                <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        Aggiornamento...
                                    </span>
                                </div>
                            </div>
                        )}

                        <GoogleMap
                            locations={locations}
                            selectedLocation={selectedLocation}
                            onLocationSelect={handleLocationSelect}
                            onMapReady={handleMapReady}
                            className="w-full h-full"
                            isUpdating={isLoading}
                        />
                    </div>

                    {/* Sidebar */}
                    <LocationsSidebar
                        locations={locations}
                        selectedLocation={selectedLocation}
                        onLocationSelect={handleLocationSelect}
                        onClose={() => setSidebarOpen(false)}
                        isOpen={sidebarOpen}
                    />
                </div>

                {/* Loading Overlay */}
                {isLoading && (
                    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
                            <div className="flex items-center gap-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <span className="text-gray-700 dark:text-gray-300">
                                    Caricamento locations...
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
