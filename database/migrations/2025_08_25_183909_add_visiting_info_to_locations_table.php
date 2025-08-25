<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->text('orari_apertura')->nullable()->after('descrizione');
            $table->string('prezzo_biglietto')->nullable()->after('orari_apertura');
            $table->string('sito_web')->nullable()->after('prezzo_biglietto');
            $table->string('telefono')->nullable()->after('sito_web');
            $table->text('note_visitatori')->nullable()->after('telefono');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->dropColumn([
                'orari_apertura',
                'prezzo_biglietto',
                'sito_web',
                'telefono',
                'note_visitatori'
            ]);
        });
    }
};
