/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { type Auto } from '../../auto/entity/auto.entity.js';
import { type Fahrzeugklasse } from './../../auto/entity/fahrzeugklasse.entity.js';

// TypeORM kann keine SQL-Skripte ausfuehren

export const autos: Auto[] = [
    // -------------------------------------------------------------------------
    // L e s e n
    // -------------------------------------------------------------------------
    {
        id: '00000000-0000-0000-0000-000000000001',
        version: 0,
        marke: 'Tesla',
        typ: 'ELEKTRO',
        preis: 1500,
        lieferbar: true,
        rabatt: 700,
        datum: new Date('2022-02-01'),
        fahrzeugklassen: [],
        erzeugt: new Date('2022-02-01'),
        aktualisiert: new Date('2022-02-01'),
    },
    {
        id: '00000000-0000-0000-0000-000000000002',
        version: 0,
        marke: 'Porsche',
        typ: 'KRAFTSTOFF',
        preis: 3500,
        lieferbar: true,
        rabatt: 1250,
        datum: new Date('2022-02-02'),
        fahrzeugklassen: [],
        erzeugt: new Date('2022-02-02'),
        aktualisiert: new Date('2022-02-02'),
    },
    {
        id: '00000000-0000-0000-0000-000000000003',
        version: 0,
        marke: 'Bmw',
        typ: 'ELEKTRO',
        preis: 1700,
        lieferbar: true,
        rabatt: 0,
        datum: new Date('2022-02-03'),
        fahrzeugklassen: [],
        erzeugt: new Date('2022-02-03'),
        aktualisiert: new Date('2022-02-03'),
    },
    // -------------------------------------------------------------------------
    // A e n d e r n
    // -------------------------------------------------------------------------
    {
        id: '00000000-0000-0000-0000-000000000040',
        version: 0,
        marke: 'Ford',
        typ: 'KRAFTSTOFF',
        preis: 850,
        lieferbar: true,
        rabatt: 50,
        datum: new Date('2022-02-04'),
        fahrzeugklassen: [],
        erzeugt: new Date('2022-02-04'),
        aktualisiert: new Date('2022-02-04'),
    },
    // -------------------------------------------------------------------------
    // L o e s c h e n
    // -------------------------------------------------------------------------
    {
        id: '00000000-0000-0000-0000-000000000050',
        version: 0,
        marke: 'Mercedes',
        typ: 'ELEKTRO',
        preis: 2500,
        lieferbar: true,
        rabatt: 500,
        datum: new Date('2022-02-05'),
        fahrzeugklassen: [],
        erzeugt: new Date('2022-02-05'),
        aktualisiert: new Date('2022-02-05'),
    },
    {
        id: '00000000-0000-0000-0000-000000000060',
        version: 0,
        marke: 'Lada',
        typ: 'KRAFTSTOFF',
        preis: 300,
        lieferbar: true,
        rabatt: 0,
        datum: new Date('2022-02-06'),
        fahrzeugklassen: [],
        erzeugt: new Date('2022-02-06'),
        aktualisiert: new Date('2022-02-06'),
    },
];

export const fahrzeugklassen: Fahrzeugklasse[] = [
    {
        id: '00000000-0000-0000-0000-010000000001',
        auto: autos[0],
        fahrzeugklasse: 'CABRIO',
    },
    {
        id: '00000000-0000-0000-0000-020000000001',
        auto: autos[1],
        fahrzeugklasse: 'SPORT',
    },
    {
        id: '00000000-0000-0000-0000-030000000001',
        auto: autos[2],
        fahrzeugklasse: 'CABRIO',
    },
    {
        id: '00000000-0000-0000-0000-030000000002',
        auto: autos[2],
        fahrzeugklasse: 'SPORT',
    },
    {
        id: '00000000-0000-0000-0000-500000000001',
        auto: autos[4],
        fahrzeugklasse: 'CABRIO',
    },
    {
        id: '00000000-0000-0000-0000-600000000001',
        auto: autos[5],
        fahrzeugklasse: 'SPORT',
    },
];

autos[0]!.fahrzeugklassen.push(fahrzeugklassen[0]!);
autos[1]!.fahrzeugklassen.push(fahrzeugklassen[1]!);
autos[2]!.fahrzeugklassen.push(fahrzeugklassen[2]!, fahrzeugklassen[3]!);
autos[4]!.fahrzeugklassen.push(fahrzeugklassen[4]!);
autos[5]!.fahrzeugklassen.push(fahrzeugklassen[5]!);

/* eslint-enable @typescript-eslint/no-non-null-assertion */
