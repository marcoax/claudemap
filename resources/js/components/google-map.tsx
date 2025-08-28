import { Loader } from '@googlemaps/js-api-loader';
import { useEffect, useRef, useState } from 'react';

import { type Location } from '@/types/location';

interface GoogleMapProps {
    locations: Location[];
    selectedLocation?: Location | null;
    onLocationSelect: (location: Location) => void;
    onMapReady?: (map: google.maps.Map) => void;
    className?: string;
    isUpdating?: boolean;
}

const getMarkerColor = (stato: string) => {
    switch (stato) {
        case 'attivo':
            return '#10B981';
        case 'disattivo':
            return '#6B7280';
        case 'in_allarme':
            return '#EF4444';
        default:
            return '#6B7280';
    }
};

export default function GoogleMap({
    locations,
    selectedLocation,
    onLocationSelect,
    onMapReady,
    className = 'w-full h-full',
    isUpdating = false,
}: GoogleMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
    const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

    useEffect(() => {
        const initMap = async () => {
            try {
                const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
                if (!apiKey) {
                    throw new Error('Google Maps API key non configurata');
                }

                const loader = new Loader({
                    apiKey,
                    version: 'weekly',
                    libraries: ['marker'],
                });

                const { Map } = await loader.importLibrary('maps');
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { AdvancedMarkerElement, PinElement } = await loader.importLibrary('marker');

                if (!mapRef.current) return;

                const mapInstance = new Map(mapRef.current, {
                    center: { lat: 42.5, lng: 12.5 },
                    zoom: 6,
                    mapId: 'DEMO_MAP_ID',
                    streetViewControl: true,
                    fullscreenControl: true,
                    zoomControl: true,
                    mapTypeControl: false,
                });

                mapInstanceRef.current = mapInstance;
                infoWindowRef.current = new google.maps.InfoWindow();

                // Mark Google Maps as fully loaded
                setIsGoogleMapsLoaded(true);

                if (onMapReady) {
                    onMapReady(mapInstance);
                }

                setIsLoading(false);
            } catch (err) {
                console.error('Errore inizializzazione mappa:', err);
                setError(err instanceof Error ? err.message : 'Errore sconosciuto');
                setIsLoading(false);
            }
        };

        initMap();
    }, [onMapReady]);

    useEffect(() => {
        if (!mapInstanceRef.current || !locations.length || !isGoogleMapsLoaded) return;

        // Wait for Google Maps marker library to be loaded
        if (typeof google === 'undefined' || !google.maps || !google.maps.marker) return;

        markersRef.current.forEach(marker => marker.map = null);
        markersRef.current = [];


        const { AdvancedMarkerElement, PinElement } = google.maps.marker;

        locations.forEach(location => {
            const pinElement = new PinElement({
                background: getMarkerColor(location.stato),
                borderColor: '#FFFFFF',
                glyphColor: '#FFFFFF',
                scale: 1.2,
            });

            const marker = new AdvancedMarkerElement({
                map: mapInstanceRef.current,
                position: { lat: Number(location.latitude), lng: Number(location.longitude) },
                content: pinElement.element,
                title: location.titolo,
            });

            marker.addListener('click', async () => {
                onLocationSelect(location);

                if (infoWindowRef.current) {
                    // Show loading content first
                    const loadingContent = `
                        <div class="p-3">
                            <h3 class="font-semibold text-lg mb-2">${location.titolo}</h3>
                            <p class="text-sm text-gray-600 mb-2">${location.indirizzo}</p>
                            <div class="flex items-center gap-2 mb-2">
                                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span class="text-sm text-gray-600">Caricamento...</span>
                            </div>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                  style="background-color: ${getMarkerColor(location.stato)}20; color: ${getMarkerColor(location.stato)};">
                                ${location.stato === 'attivo' ? 'Attivo' :
                                  location.stato === 'disattivo' ? 'Disattivo' : 'In Allarme'}
                            </span>
                        </div>
                    `;

                    infoWindowRef.current.setContent(loadingContent);
                    infoWindowRef.current.open(mapInstanceRef.current, marker);

                    try {
                        // Fetch location details
                        const response = await fetch(`/api/locations/${location.id}/details`);
                        if (response.ok) {
                            const locationDetails = await response.json();

                            const contentWithDescription = `
                                <div class="p-4 max-w-sm">
                                    <h3 class="font-semibold text-lg mb-2">${location.titolo}</h3>
                                    <p class="text-sm text-gray-600 mb-2">${location.indirizzo}</p>
                                    <p class="text-sm text-gray-700 mb-3">${locationDetails.descrizione || 'Nessuna descrizione disponibile.'}</p>

                                    ${locationDetails.orari_apertura ? `
                                    <div class="mb-2">
                                        <strong class="text-xs text-gray-800">🕐 Orari:</strong>
                                        <p class="text-xs text-gray-600">${locationDetails.orari_apertura}</p>
                                    </div>` : ''}

                                    ${locationDetails.prezzo_biglietto ? `
                                    <div class="mb-2">
                                        <strong class="text-xs text-gray-800">💰 Prezzi:</strong>
                                        <p class="text-xs text-gray-600">${locationDetails.prezzo_biglietto}</p>
                                    </div>` : ''}

                                    ${locationDetails.telefono ? `
                                    <div class="mb-2">
                                        <strong class="text-xs text-gray-800">📞 Telefono:</strong>
                                        <p class="text-xs text-gray-600">${locationDetails.telefono}</p>
                                    </div>` : ''}

                                    ${locationDetails.sito_web ? `
                                    <div class="mb-2">
                                        <strong class="text-xs text-gray-800">🌐 Sito web:</strong>
                                        <a href="${locationDetails.sito_web}" target="_blank" class="text-xs text-blue-600 hover:underline">${locationDetails.sito_web}</a>
                                    </div>` : ''}

                                    ${locationDetails.note_visitatori ? `
                                    <div class="mb-3">
                                        <strong class="text-xs text-gray-800">ℹ️ Note per i visitatori:</strong>
                                        <p class="text-xs text-gray-600">${locationDetails.note_visitatori}</p>
                                    </div>` : ''}

                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                          style="background-color: ${getMarkerColor(location.stato)}20; color: ${getMarkerColor(location.stato)};">
                                        ${location.stato === 'attivo' ? 'Attivo' :
                                          location.stato === 'disattivo' ? 'Disattivo' : 'In Allarme'}
                                    </span>
                                </div>
                            `;

                            infoWindowRef.current.setContent(contentWithDescription);
                        }
                    } catch (error) {
                        console.error('Error fetching location details:', error);

                        // Show error message
                        const errorContent = `
                            <div class="p-3">
                                <h3 class="font-semibold text-lg mb-2">${location.titolo}</h3>
                                <p class="text-sm text-gray-600 mb-2">${location.indirizzo}</p>
                                <p class="text-sm text-red-600 mb-3">Errore nel caricamento della descrizione.</p>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                      style="background-color: ${getMarkerColor(location.stato)}20; color: ${getMarkerColor(location.stato)};">
                                    ${location.stato === 'attivo' ? 'Attivo' :
                                      location.stato === 'disattivo' ? 'Disattivo' : 'In Allarme'}
                                </span>
                            </div>
                        `;

                        infoWindowRef.current.setContent(errorContent);
                    }
                }
            });

            markersRef.current.push(marker);
        });

        if (locations.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            locations.forEach(location => {
                bounds.extend({ lat: Number(location.latitude), lng: Number(location.longitude) });
            });

            // Fit bounds with padding for better visibility
            mapInstanceRef.current.fitBounds(bounds, { padding: 50 });

            // Ensure minimum zoom level for single locations
            if (locations.length === 1) {
                setTimeout(() => {
                    if (mapInstanceRef.current && mapInstanceRef.current.getZoom() && mapInstanceRef.current.getZoom()! > 15) {
                        mapInstanceRef.current.setZoom(15);
                    }
                }, 100);
            }
        } else {
            // If no locations, reset to Italy view
            mapInstanceRef.current.setCenter({ lat: 42.5, lng: 12.5 });
            mapInstanceRef.current.setZoom(6);
        }
    }, [locations, onLocationSelect, isGoogleMapsLoaded]);

    useEffect(() => {
        if (!mapInstanceRef.current || !selectedLocation) return;

        const position = { lat: Number(selectedLocation.latitude), lng: Number(selectedLocation.longitude) };
        mapInstanceRef.current.setCenter(position);
        mapInstanceRef.current.setZoom(15);

        const marker = markersRef.current.find((marker, index) =>
            locations[index]?.id === selectedLocation.id
        );

        if (marker && infoWindowRef.current) {
            const showLocationDetails = async () => {
                // Show loading content first
                const loadingContent = `
                    <div class="p-3">
                        <h3 class="font-semibold text-lg mb-2">${selectedLocation.titolo}</h3>
                        <p class="text-sm text-gray-600 mb-2">${selectedLocation.indirizzo}</p>
                        <div class="flex items-center gap-2 mb-2">
                            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span class="text-sm text-gray-600">Caricamento...</span>
                        </div>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                              style="background-color: ${getMarkerColor(selectedLocation.stato)}20; color: ${getMarkerColor(selectedLocation.stato)};">
                            ${selectedLocation.stato === 'attivo' ? 'Attivo' :
                              selectedLocation.stato === 'disattivo' ? 'Disattivo' : 'In Allarme'}
                        </span>
                    </div>
                `;

                infoWindowRef.current!.setContent(loadingContent);
                infoWindowRef.current!.open(mapInstanceRef.current, marker);

                try {
                    // Fetch location details
                    const response = await fetch(`/api/locations/${selectedLocation.id}/details`);
                    if (response.ok) {
                        const locationDetails = await response.json();

                        const contentWithDescription = `
                            <div class="p-4 max-w-sm">
                                <h3 class="font-semibold text-lg mb-2">${selectedLocation.titolo}</h3>
                                <p class="text-sm text-gray-600 mb-2">${selectedLocation.indirizzo}</p>
                                <p class="text-sm text-gray-700 mb-3">${locationDetails.descrizione || 'Nessuna descrizione disponibile.'}</p>

                                ${locationDetails.orari_apertura ? `
                                <div class="mb-2">
                                    <strong class="text-xs text-gray-800">🕐 Orari:</strong>
                                    <p class="text-xs text-gray-600">${locationDetails.orari_apertura}</p>
                                </div>` : ''}

                                ${locationDetails.prezzo_biglietto ? `
                                <div class="mb-2">
                                    <strong class="text-xs text-gray-800">💰 Prezzi:</strong>
                                    <p class="text-xs text-gray-600">${locationDetails.prezzo_biglietto}</p>
                                </div>` : ''}

                                ${locationDetails.telefono ? `
                                <div class="mb-2">
                                    <strong class="text-xs text-gray-800">📞 Telefono:</strong>
                                    <p class="text-xs text-gray-600">${locationDetails.telefono}</p>
                                </div>` : ''}

                                ${locationDetails.sito_web ? `
                                <div class="mb-2">
                                    <strong class="text-xs text-gray-800">🌐 Sito web:</strong>
                                    <a href="${locationDetails.sito_web}" target="_blank" class="text-xs text-blue-600 hover:underline">${locationDetails.sito_web}</a>
                                </div>` : ''}

                                ${locationDetails.note_visitatori ? `
                                <div class="mb-3">
                                    <strong class="text-xs text-gray-800">ℹ️ Note per i visitatori:</strong>
                                    <p class="text-xs text-gray-600">${locationDetails.note_visitatori}</p>
                                </div>` : ''}

                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                      style="background-color: ${getMarkerColor(selectedLocation.stato)}20; color: ${getMarkerColor(selectedLocation.stato)};">
                                    ${selectedLocation.stato === 'attivo' ? 'Attivo' :
                                      selectedLocation.stato === 'disattivo' ? 'Disattivo' : 'In Allarme'}
                                </span>
                            </div>
                        `;

                        infoWindowRef.current!.setContent(contentWithDescription);
                    }
                } catch (error) {
                    console.error('Error fetching location details:', error);

                    // Show error message
                    const errorContent = `
                        <div class="p-3">
                            <h3 class="font-semibold text-lg mb-2">${selectedLocation.titolo}</h3>
                            <p class="text-sm text-gray-600 mb-2">${selectedLocation.indirizzo}</p>
                            <p class="text-sm text-red-600 mb-3">Errore nel caricamento della descrizione.</p>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                  style="background-color: ${getMarkerColor(selectedLocation.stato)}20; color: ${getMarkerColor(selectedLocation.stato)};">
                                ${selectedLocation.stato === 'attivo' ? 'Attivo' :
                                  selectedLocation.stato === 'disattivo' ? 'Disattivo' : 'In Allarme'}
                            </span>
                        </div>
                    `;

                    infoWindowRef.current!.setContent(errorContent);
                }
            };

            showLocationDetails();
        }
    }, [selectedLocation, locations, isGoogleMapsLoaded]);

    if (error) {
        return (
            <div className={`flex items-center justify-center bg-gray-50 dark:bg-gray-900 ${className}`}>
                <div className="text-center p-6">
                    <div className="text-red-500 text-4xl mb-4">⚠️</div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Errore Caricamento Mappa
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 z-10">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Caricamento mappa...</p>
                    </div>
                </div>
            )}
            {isUpdating && (
                <div className="absolute top-4 right-4 z-10">
                    <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            Aggiornamento mappa...
                        </span>
                    </div>
                </div>
            )}
            <div ref={mapRef} className="w-full h-full rounded-lg" />
        </div>
    );
}
