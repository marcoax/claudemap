<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LocationController extends Controller
{
    public function index(Request $request)
    {
        // Validate incoming filters to avoid unexpected queries
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'stato' => ['nullable', 'string', function ($attribute, $value, $fail) {
                if ($value !== null && $value !== 'tutti' && !in_array($value, Location::STATI, true)) {
                    $fail('Valore stato non valido.');
                }
            }],
        ]);

        $query = Location::query();

        if (!empty($validated['search'])) {
            $query->search($validated['search']);
        }

        if (!empty($validated['stato']) && $validated['stato'] !== 'tutti') {
            $query->byStato($validated['stato']);
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
                'search' => $validated['search'] ?? null,
                'stato' => $validated['stato'] ?? null,
            ],
        ]);
    }

    public function search(Request $request)
    {
        // Validate search params (API)
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:255'],
            'stato' => ['nullable', 'string', function ($attribute, $value, $fail) {
                if ($value !== null && $value !== 'tutti' && !in_array($value, Location::STATI, true)) {
                    $fail('Valore stato non valido.');
                }
            }],
            'lat' => ['nullable', 'numeric'],
            'lng' => ['nullable', 'numeric'],
            'radius' => ['nullable', 'numeric', 'min:0'],
        ]);

        $query = Location::query();

        if (!empty($validated['q'])) {
            $query->search($validated['q']);
        }

        if (!empty($validated['stato']) && $validated['stato'] !== 'tutti') {
            $query->byStato($validated['stato']);
        }

        if (isset($validated['lat'], $validated['lng'])) {
            $radiusKm = isset($validated['radius']) ? (float)$validated['radius'] : 10.0;
            $query->nearby((float)$validated['lat'], (float)$validated['lng'], $radiusKm);
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
