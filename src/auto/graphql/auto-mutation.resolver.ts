import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { type CreateError, type UpdateError } from '../service/errors.js';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { type Auto } from '../entity/auto.entity.js';
import { AutoWriteService } from '../service/auto-write.service.js';
import { type IdInput } from './auto-query.resolver.js';
import { JwtAuthGraphQlGuard } from '../../security/auth/jwt/jwt-auth-graphql.guard.js';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { Roles } from '../../security/auth/roles/roles.decorator.js';
import { RolesGraphQlGuard } from '../../security/auth/roles/roles-graphql.guard.js';
import { type Fahrzeugklasse } from '../entity/fahrzeugklasse.entity.js';
import { UserInputError } from 'apollo-server-express';
import { getLogger } from '../../logger/logger.js';

type AutoCreateDTO = Omit<
    Auto,
    'aktualisiert' | 'erzeugt' | 'id' | 'fahrzeugklassen' | 'version'
> & { fahrzeugklassen: string[] };
type AutoUpdateDTO = Omit<Auto, 'aktualisiert' | 'erzeugt' | 'fahrzeugklassen'>;

@Resolver()
@UseGuards(JwtAuthGraphQlGuard, RolesGraphQlGuard)
@UseInterceptors(ResponseTimeInterceptor)
export class AutoMutationResolver {
    readonly #service: AutoWriteService;

    readonly #logger = getLogger(AutoMutationResolver.name);

    constructor(service: AutoWriteService) {
        this.#service = service;
    }

    @Mutation()
    @Roles('admin', 'mitarbeiter')
    async create(@Args('input') autoDTO: AutoCreateDTO) {
        this.#logger.debug('create: autoDTO=%o', autoDTO);

        const result = await this.#service.create(this.#dtoToAuto(autoDTO));
        this.#logger.debug('createAuto: result=%o', result);

        if (Object.prototype.hasOwnProperty.call(result, 'type')) {
            // UserInputError liefert Statuscode 200
            throw new UserInputError(
                this.#errorMsgCreateAuto(result as CreateError),
            );
        }
        return result;
    }

    @Mutation()
    @Roles('admin', 'mitarbeiter')
    async update(@Args('input') auto: AutoUpdateDTO) {
        this.#logger.debug('update: buch=%o', auto);
        const versionStr = `"${auto.version?.toString()}"`;

        const result = await this.#service.update(
            auto.id,
            auto as Auto,
            versionStr,
        );
        if (typeof result === 'object') {
            throw new UserInputError(this.#errorMsgUpdateAuto(result));
        }
        this.#logger.debug('updateAuto: result=%d', result);
        return result;
    }

    @Mutation()
    @Roles('admin')
    async delete(@Args() id: IdInput) {
        const idStr = id.id;
        this.#logger.debug('delete: id=%s', idStr);
        const result = await this.#service.delete(idStr);
        this.#logger.debug('deleteAuto: result=%s', result);
        return result;
    }

    #dtoToAuto(autoDTO: AutoCreateDTO): Auto {
        const auto: Auto = {
            id: undefined,
            version: undefined,
            marke: autoDTO.marke,
            typ: autoDTO.typ,
            preis: autoDTO.preis,
            lieferbar: autoDTO.lieferbar,
            rabatt: autoDTO.rabatt,
            datum: autoDTO.datum,
            fahrzeugklassen: [],
            erzeugt: undefined,
            aktualisiert: undefined,
        };

        autoDTO.fahrzeugklassen.forEach((s) => {
            const fahrzeugklasse: Fahrzeugklasse = {
                id: undefined,
                fahrzeugklasse: s,
                auto,
            };
            auto.fahrzeugklassen.push(fahrzeugklasse);
        });

        return auto;
    }

    #errorMsgCreateAuto(err: CreateError) {
        switch (err.type) {
            case 'ConstraintViolations':
                return err.messages.join(' ');
            default:
                return 'Unbekannter Fehler';
        }
    }

    #errorMsgUpdateAuto(err: UpdateError) {
        switch (err.type) {
            case 'ConstraintViolations':
                return err.messages.join(' ');
            case 'AutoNotExists':
                return `Es gibt kein Auto mit der ID ${err.id}`;
            case 'VersionInvalid':
                return `"${err.version}" ist keine gueltige Versionsnummer`;
            case 'VersionOutdated':
                return `Die Versionsnummer "${err.version}" ist nicht mehr aktuell`;
            default:
                return 'Unbekannter Fehler';
        }
    }
}