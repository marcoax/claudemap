<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LocationController extends Controller
{
    public function index(Request $request)
    {
        $query = Location::query();

        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('stato') && $request->stato !== 'tutti') {
            $query->byStato($request->stato);
        }

        $locations = $query->select([
            'id',
            'titolo',
            'indirizzo',
            'latitude',
            'longitude',
            'stato'
        ])->get();

        $totalCount = Location::count();
        $filteredCount = $locations->count();

        if ($request->wantsJson()) {
            return response()->json([
                'locations' => $locations,
                'total_count' => $totalCount,
                'filtered_count' => $filteredCount,
            ]);
        }

        return Inertia::render('welcome', [
            'locations' => $locations,
            'total_count' => $totalCount,
            'filtered_count' => $filteredCount,
            'filters' => [
                'search' => $request->search,
                'stato' => $request->stato,
            ],
        ]);
    }

    public function search(Request $request)
    {
        $query = Location::query();

        if ($request->filled('q')) {
            $query->search($request->q);
        }

        if ($request->filled('stato') && $request->stato !== 'tutti') {
            $query->byStato($request->stato);
        }

        if ($request->filled('lat') && $request->filled('lng')) {
            $radiusKm = $request->input('radius', 10);
            $query->nearby($request->lat, $request->lng, $radiusKm);
        }

        $locations = $query->select([
            'id',
            'titolo',
            'indirizzo',
            'latitude',
            'longitude',
            'stato'
        ])->limit(20)->get();

        return response()->json([
            'locations' => $locations,
            'count' => $locations->count(),
        ]);
    }

    public function show(Location $location)
    {
        return response()->json($location);
    }

    public function details(Location $location)
    {
        return response()->json([
            'id' => $location->id,
            'titolo' => $location->titolo,
            'descrizione' => $location->descrizione,
            'indirizzo' => $location->indirizzo,
            'latitude' => $location->latitude,
            'longitude' => $location->longitude,
            'stato' => $location->stato,
            'stato_badge' => $location->stato_badge,
            'stato_color' => $location->stato_color,
            'orari_apertura' => $location->orari_apertura,
            'prezzo_biglietto' => $location->prezzo_biglietto,
            'sito_web' => $location->sito_web,
            'telefono' => $location->telefono,
            'note_visitatori' => $location->note_visitatori,
            'created_at' => $location->created_at,
            'updated_at' => $location->updated_at,
        ]);
    }
}
