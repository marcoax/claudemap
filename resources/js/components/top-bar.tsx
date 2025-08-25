import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Menu, RefreshCw, Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Location {
    id: number;
    titolo: string;
    indirizzo: string;
    latitude: number;
    longitude: number;
    stato: 'attivo' | 'disattivo' | 'in_allarme';
}

interface TopBarProps {
    locations: Location[];
    onSearch: (query: string) => void;
    onFilterChange: (filter: string) => void;
    onReset: () => void;
    onToggleSidebar: () => void;
    currentFilter: string;
    searchQuery: string;
    totalCount: number;
    filteredCount: number;
    sidebarOpen: boolean;
}

interface SearchSuggestion {
    id: number;
    titolo: string;
    indirizzo: string;
}

export default function TopBar({
    locations,
    onSearch,
    onFilterChange,
    onReset,
    onToggleSidebar,
    currentFilter,
    searchQuery,
    totalCount,
    filteredCount,
    sidebarOpen,
}: TopBarProps) {
    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        setLocalSearchQuery(searchQuery);
    }, [searchQuery]);

    useEffect(() => {
        if (localSearchQuery.trim().length > 0) {
            const filtered = locations
                .filter(location => 
                    location.titolo.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
                    location.indirizzo.toLowerCase().includes(localSearchQuery.toLowerCase())
                )
                .slice(0, 5)
                .map(location => ({
                    id: location.id,
                    titolo: location.titolo,
                    indirizzo: location.indirizzo,
                }));
            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [localSearchQuery, locations]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(localSearchQuery);
        setShowSuggestions(false);
    };

    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
        setLocalSearchQuery(suggestion.titolo);
        onSearch(suggestion.titolo);
        setShowSuggestions(false);
    };

    const handleSearchClear = () => {
        setLocalSearchQuery('');
        onSearch('');
        setShowSuggestions(false);
    };


    const statusCounts = locations.reduce((acc, location) => {
        acc[location.stato] = (acc[location.stato] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onToggleSidebar}
                            className="lg:hidden"
                        >
                            <Menu className="h-4 w-4" />
                        </Button>
                        
                        <div className="hidden lg:block">
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Dashboard Locations
                            </h1>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onReset}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Reset
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onToggleSidebar}
                        className="hidden lg:flex items-center gap-2"
                    >
                        <Menu className="h-4 w-4" />
                        {sidebarOpen ? 'Chiudi' : 'Apri'} Sidebar
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 lg:flex-1 lg:justify-between">
                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <form onSubmit={handleSearchSubmit} className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <Input
                                    type="text"
                                    placeholder="Cerca per nome o indirizzo..."
                                    value={localSearchQuery}
                                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                                    className="pl-10 pr-10"
                                />
                                {localSearchQuery && (
                                    <button
                                        type="button"
                                        onClick={handleSearchClear}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                    </button>
                                )}
                            </form>
                            
                            {showSuggestions && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                                    {suggestions.map((suggestion) => (
                                        <button
                                            key={suggestion.id}
                                            type="button"
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                                        >
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {suggestion.titolo}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {suggestion.indirizzo}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Select value={currentFilter} onValueChange={onFilterChange}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filtra per stato" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="tutti">Tutti ({totalCount})</SelectItem>
                                <SelectItem value="attivo">
                                    Attivo ({statusCounts.attivo || 0})
                                </SelectItem>
                                <SelectItem value="disattivo">
                                    Disattivo ({statusCounts.disattivo || 0})
                                </SelectItem>
                                <SelectItem value="in_allarme">
                                    In Allarme ({statusCounts.in_allarme || 0})
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="hidden sm:inline-flex">
                            Visualizzando {filteredCount} di {totalCount} locations
                        </Badge>

                        <div className="flex gap-2 sm:hidden">
                            <Badge variant="secondary" className="text-xs">
                                {filteredCount}/{totalCount}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}