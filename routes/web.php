<?php

use App\Http\Controllers\LocationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [LocationController::class, 'index'])->name('home');


    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');


Route::prefix('api')->middleware(['throttle:60,1'])->group(function () {
    Route::get('locations/search', [LocationController::class, 'search']);
    Route::get('locations/{location}', [LocationController::class, 'show']);
    Route::get('locations/{location}/details', [LocationController::class, 'details']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
