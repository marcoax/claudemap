export type Stato = 'attivo' | 'disattivo' | 'in_allarme';

export interface Location {
  id: number;
  titolo: string;
  indirizzo: string;
  latitude: number;
  longitude: number;
  stato: Stato;
}

export interface DetailedLocation extends Location {
  descrizione?: string;
  stato_badge?: string;
  stato_color?: string;
  orari_apertura?: string | null;
  prezzo_biglietto?: string | null;
  sito_web?: string | null;
  telefono?: string | null;
  note_visitatori?: string | null;
  created_at?: string;
  updated_at?: string;
}
