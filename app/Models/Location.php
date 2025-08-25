<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    protected $fillable = [
        'titolo',
        'descrizione',
        'indirizzo',
        'latitude',
        'longitude',
        'stato',
        'orari_apertura',
        'prezzo_biglietto',
        'sito_web',
        'telefono',
        'note_visitatori',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    public function scopeAttivo(Builder $query): void
    {
        $query->where('stato', 'attivo');
    }

    public function scopeDisattivo(Builder $query): void
    {
        $query->where('stato', 'disattivo');
    }

    public function scopeInAllarme(Builder $query): void
    {
        $query->where('stato', 'in_allarme');
    }

    public function scopeByStato(Builder $query, string $stato): void
    {
        $query->where('stato', $stato);
    }

    public function scopeSearch(Builder $query, string $search): void
    {
        $query->where(function ($q) use ($search) {
            $q->where('titolo', 'like', "%{$search}%")
              ->orWhere('descrizione', 'like', "%{$search}%")
              ->orWhere('indirizzo', 'like', "%{$search}%");
        });
    }

    public function scopeNearby(Builder $query, float $latitude, float $longitude, float $radiusKm = 10): void
    {
        $query->selectRaw(
            '*, ( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ) ) AS distance',
            [$latitude, $longitude, $latitude]
        )->having('distance', '<', $radiusKm)->orderBy('distance');
    }

    public function getStatoColorAttribute(): string
    {
        return match ($this->stato) {
            'attivo' => 'green',
            'disattivo' => 'gray',
            'in_allarme' => 'red',
            default => 'gray',
        };
    }

    public function getStatoBadgeAttribute(): string
    {
        return match ($this->stato) {
            'attivo' => 'Attivo',
            'disattivo' => 'Disattivo',
            'in_allarme' => 'In Allarme',
            default => 'Sconosciuto',
        };
    }
}
