import { Args, Query, Resolver } from '@nestjs/graphql';
import { type Auto } from '../entity/auto.entity.js';
import { AutoReadService } from '../service/auto-read.service.js';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { UseInterceptors } from '@nestjs/common';
import { UserInputError } from 'apollo-server-express';
import { getLogger } from '../../logger/logger.js';

export type AutoDTO = Omit<
    Auto,
    'aktualisiert' | 'erzeugt' | 'fahrzeugklassen'
> & { fahrzeugklassen: string[] };
export interface IdInput {
    id: string;
}

@Resolver()
@UseInterceptors(ResponseTimeInterceptor)
export class AutoQueryResolver {
    readonly #service: AutoReadService;

    readonly #logger = getLogger(AutoQueryResolver.name);

    constructor(service: AutoReadService) {
        this.#service = service;
    }

    @Query('auto')
    async findById(@Args() id: IdInput) {
        const idStr = id.id;
        this.#logger.debug('findById: id=%s', idStr);

        const auto = await this.#service.findById(idStr);
        if (auto === undefined) {
            // UserInputError liefert Statuscode 200
            throw new UserInputError(
                `Es wurde kein Auto mit der ID ${idStr} gefunden.`,
            );
        }
        const autoDTO = this.#toAutoDTO(auto);
        this.#logger.debug('findById: autoDTO=%o', autoDTO);
        return autoDTO;
    }

    @Query('autos')
    async find(@Args() marke : { marke: string } | undefined) {
        const markeStr = marke?.marke;
        this.#logger.debug('find: marke=%s', markeStr);
        const suchkriterium = markeStr === undefined ? {} : { marke: markeStr };
        const autos = await this.#service.find(suchkriterium);
        if (autos.length === 0) {
            // UserInputError liefert Statuscode 200
            throw new UserInputError('Es wurden keine Autos gefunden.');
        }

        const autosDTO = autos.map((auto:any) => this.#toAutoDTO(auto));
        this.#logger.debug('find: autosDTO=%o', autosDTO);
        return autosDTO;
    }

    #toAutoDTO(auto: Auto) {
        const fahrzeugklassen = auto.fahrzeugklassen.map(
            (fahrzeugklasse) => fahrzeugklasse.fahrzeugklasse!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
        );
        const autoDTO: AutoDTO = {
            id: auto.id,
            version: auto.version,
            marke: auto.marke,
            typ: auto.typ,
            preis: auto.preis,
            lieferbar: auto.lieferbar,
            rabatt: auto.rabatt,
            datum: auto.datum,
            fahrzeugklassen,
        };
        return autoDTO;
    }
}
