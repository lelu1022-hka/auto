//Können wir auch ohne die Klasse leben?

/**
 * Das Modul besteht aus der Entity-Klasse.
 * @packageDocumentation
 */

import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Auto } from './auto.entity.js';

/**
 * Entity-Klasse zu einem relationalen Tabelle
 */
@Entity()
export class Fahrzeugklasse {
    @Column('char')
    @PrimaryColumn('uuid')
    id: string | undefined;

    @ManyToOne(() => Auto, (auto) => auto.fahrzeugklassen)
    @JoinColumn({ name: 'auto_id' })
    readonly auto: Auto | null | undefined;

    @Column('varchar')
    @ApiProperty({ example: 'Die Fahrzeugklasse', type: String })
    readonly fahrzeugklasse: string | null | undefined;
}
