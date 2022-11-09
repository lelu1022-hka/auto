/**
 * Das Modul besteht aus der Entity-Klasse.
 * @packageDocumentation
 */

import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryColumn,
    UpdateDateColumn,
    VersionColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { DecimalTransformer } from './decimal-transformer.js';
import { Fahrzeugklasse } from './fahrzeugklasse.entity.js';

/**
 * Alias-Typ für gültige Strings bei der Art eines Autos.
 */
export type MotorTyp = 'ELEKTRO' | 'KRAFTSTOFF';

/**
 * Entity-Klasse zu einem relationalen Tabelle
 */
@Entity()
export class Auto {
    @Column('char')
    @PrimaryColumn('uuid')
    id: string | undefined;

    @VersionColumn()
    readonly version: number | undefined;

    @Column('varchar')
    @ApiProperty({ example: 'Das Modell', type: String })
    readonly marke!: string; //NOSONAR

    @Column('varchar')
    @ApiProperty({ example: 'ELEKTRO', type: String })
    readonly typ: MotorTyp | undefined;

    @Column({ type: 'decimal', transformer: new DecimalTransformer() })
    @ApiProperty({ example: 1, type: Number })
    readonly preis!: number;

    @Column({ type: 'decimal', transformer: new DecimalTransformer() })
    @ApiProperty({ example: 0.1, type: Number })
    readonly rabatt: number | undefined;

    @Column('boolean')
    @ApiProperty({ example: true, type: Boolean })
    readonly lieferbar: boolean | undefined;

    @Column('date')
    @ApiProperty({ example: '2021-01-31' })
    readonly datum: Date | string | undefined;

    @OneToMany(() => Fahrzeugklasse, (fahrzeugklasse) => fahrzeugklasse.auto, {
        eager: true,
        cascade: ['insert'],
    })
    @ApiProperty({ example: ['CABRIO', 'SPORT'] })
    readonly fahrzeugklassen!: Fahrzeugklasse[];

    @CreateDateColumn({ type: 'timestamp' })
    readonly erzeugt: Date | undefined = new Date();

    @UpdateDateColumn({ type: 'timestamp' })
    readonly aktualisiert: Date | undefined = new Date();
}
