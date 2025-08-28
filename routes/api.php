<?php

use App\Http\Controllers\LocationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the framework and assigned to the "api" middleware
| group and the "/api" URL prefix automatically via bootstrap/app.php.
|
*/

Route::get('locations/search', [LocationController::class, 'search']);
Route::get('locations/{location}', [LocationController::class, 'show']);
Route::get('locations/{location}/details', [LocationController::class, 'details']);
