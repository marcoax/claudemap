<?php

use App\Http\Controllers\LocationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [LocationController::class, 'index'])->name('home');

Route::get('dashboard', function () {
    return Inertia::render('dashboard');
})->name('dashboard');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
