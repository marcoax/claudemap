import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, X, Eye } from 'lucide-react';
import { useState } from 'react';
import { type Location, type DetailedLocation } from '@/types/location';

interface LocationsSidebarProps {
    locations: Location[];
    selectedLocation?: Location | null;
    onLocationSelect: (location: Location) => void;
    onClose: () => void;
    isOpen: boolean;
}

export default function LocationsSidebar({
    locations,
    selectedLocation,
    onLocationSelect,
    onClose,
    isOpen,
}: LocationsSidebarProps) {
    const [loadingDetails, setLoadingDetails] = useState<number | null>(null);
    const [locationDetails, setLocationDetails] = useState<Record<number, DetailedLocation>>({});

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'attivo':
                return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800';
            case 'disattivo':
                return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800';
            case 'in_allarme':
                return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'attivo':
                return 'Attivo';
            case 'disattivo':
                return 'Disattivo';
            case 'in_allarme':
                return 'In Allarme';
            default:
                return 'Sconosciuto';
        }
    };

    const loadLocationDetails = async (locationId: number) => {
        if (locationDetails[locationId]) return;

        setLoadingDetails(locationId);
        try {
            const response = await fetch(`/api/locations/${locationId}/details`);
            if (response.ok) {
                const details: DetailedLocation = await response.json();
                setLocationDetails(prev => ({
                    ...prev,
                    [locationId]: details,
                }));
            }
        } catch (error) {
            console.error('Errore caricamento dettagli:', error);
        } finally {
            setLoadingDetails(null);
        }
    };

    const truncateText = (text: string, maxLength: number = 120) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const handleLocationClick = (location: Location) => {
        onLocationSelect(location);
        loadLocationDetails(location.id);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className={`
                fixed lg:relative top-0 right-0 h-full w-80 lg:w-96
                bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700
                shadow-xl lg:shadow-none z-50
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Locations ({locations.length})
                        </h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="lg:hidden"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {locations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                                <MapPin className="h-8 w-8 mb-2" />
                                <p className="text-sm">Nessuna location trovata</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {locations.map((location) => {
                                    const isSelected = selectedLocation?.id === location.id;
                                    const details = locationDetails[location.id];
                                    const isLoadingDetails = loadingDetails === location.id;

                                    return (
                                        <Card
                                            key={location.id}
                                            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                                                isSelected
                                                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950'
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                            onClick={() => handleLocationClick(location)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="space-y-3">
                                                    {/* Header */}
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
                                                            {location.titolo}
                                                        </h3>
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-xs flex-shrink-0 ${getStatusColor(location.stato)}`}
                                                        >
                                                            {getStatusLabel(location.stato)}
                                                        </Badge>
                                                    </div>

                                                    {/* Description */}
                                                    {details?.descrizione && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                                            {truncateText(details.descrizione, 100)}
                                                        </p>
                                                    )}

                                                    {/* Address */}
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                                            {location.indirizzo}
                                                        </p>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                                                        <div className="text-xs text-gray-400">
                                                            {Number(location.latitude).toFixed(4)}, {Number(location.longitude).toFixed(4)}
                                                        </div>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleLocationClick(location);
                                                            }}
                                                            className="text-xs h-7 px-2"
                                                        >
                                                            <Eye className="h-3 w-3 mr-1" />
                                                            Mostra su Mappa
                                                        </Button>
                                                    </div>

                                                    {/* Loading indicator for details */}
                                                    {isLoadingDetails && (
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
                                                            Caricamento dettagli...
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>
                                {locations.filter(l => l.stato === 'attivo').length} Attive
                            </span>
                            <span>
                                {locations.filter(l => l.stato === 'in_allarme').length} In Allarme
                            </span>
                            <span>
                                {locations.filter(l => l.stato === 'disattivo').length} Disattive
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
