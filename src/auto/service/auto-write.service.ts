import {
    type AutoNotExists,
    type CreateError,
    type MarkeExists,
    type UpdateError,
    type VersionInvalid,
    type VersionOutdated,
} from './errors.js';
import { type DeleteResult, Repository } from 'typeorm';
import { Auto } from '../entity/auto.entity.js';
import { AutoReadService } from './auto-read.service.js';
import { AutoValidationService } from './auto-validation.service.js';
import { Fahrzeugklasse } from '../entity/fahrzeugklasse.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import RE2 from 're2';
import { getLogger } from '../../logger/logger.js';
import { v4 as uuid } from 'uuid';

/**
 * Die Klasse `AutoWriteService` implementiert den Anwendungskern für das
 * Schreiben von Autos und greift mit _TypeORM_ auf die DB zu.
 */
@Injectable()
export class AutoWriteService {
    private static readonly VERSION_PATTERN = new RE2('^"\\d*"');

    readonly #repo: Repository<Auto>;

    readonly #readService: AutoReadService;

    readonly #validationService: AutoValidationService;

    readonly #logger = getLogger(AutoWriteService.name);

    constructor(
        @InjectRepository(Auto) repo: Repository<Auto>,
        readService: AutoReadService,
        validationService: AutoValidationService,
    ) {
        this.#repo = repo;
        this.#readService = readService;
        this.#validationService = validationService;
    }

    /**
     * Ein neues Auto soll angelegt werden.
     * @param auto Das neu abzulegende Auto
     * @returns Die ID des neu angelegten Autos oder im Fehlerfall
     * [CreateError](../types/auto_service_errors.CreateError.html)
     */
    async create(auto: Auto): Promise<CreateError | string> {
        this.#logger.debug('create: auto=%o', auto);
        const validateResult = await this.#validateCreate(auto);
        if (validateResult !== undefined) {
            return validateResult;
        }

        auto.id = uuid(); // eslint-disable-line require-atomic-updates
        auto.fahrzeugklassen.forEach((fahrzeugklasse) => {
            fahrzeugklasse.id = uuid();
        });

        const autoDb = await this.#repo.save(auto);
        this.#logger.debug('create: autoDb=%o', autoDb);

        return autoDb.id!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    }

    /**
     * Ein vorhandenes Auto soll aktualisiert werden.
     * @param auto Das zu aktualisierende Auto
     * @param id ID des zu aktualisierenden Autos
     * @param version Die Versionsnummer für optimistische Synchronisation
     * @returns Die neue Versionsnummer gemäß optimistischer Synchronisation
     *  oder im Fehlerfall [UpdateError](../types/auto_service_errors.UpdateError.html)
     */
    async update(
        id: string | undefined,
        auto: Auto,
        version: string,
    ): Promise<UpdateError | number> {
        this.#logger.debug(
            'update: id=%s, auto=%o, version=%s',
            id,
            auto,
            version,
        );
        if (id === undefined || !this.#validationService.validateId(id)) {
            this.#logger.debug('update: Keine gueltige ID');

            return { type: 'AutoNotExists', id };
        }

        const validateResult = await this.#validateUpdate(auto, id, version);
        this.#logger.debug('update: validateResult=%o', validateResult);
        if (!(validateResult instanceof Auto)) {
            return validateResult;
        }

        const autoNeu = validateResult;
        const merged = this.#repo.merge(autoNeu);
        this.#logger.debug('update: merged=%o', merged);
        const updated = await this.#repo.save(merged);
        this.#logger.debug('update: updated=%o', updated);

        return updated.version!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    }

    /**
     * Ein Auto wird asynchron anhand seiner ID gelöscht.
     *
     * @param id ID des zu löschenden Autos
     * @returns true, falls das Auto vorhanden war und gelöscht wurde. Sonst false.
     */
    async delete(id: string) {
        this.#logger.debug('delete: id=%s', id);
        if (!this.#validationService.validateId(id)) {
            this.#logger.debug('delete: Keine gueltige ID');
            return false;
        }

        const auto = await this.#readService.findById(id);
        if (auto === undefined) {
            return false;
        }

        let deleteResult: DeleteResult | undefined;
        await this.#repo.manager.transaction(async (transactionalMgr) => {
            const { fahrzeugklassen } = auto;
            const fahrzeugklassenIds = fahrzeugklassen.map(
                (fahrzeugklasse) => fahrzeugklasse.id,
            );
            const deleteResultFahrzeugklassen = await transactionalMgr.delete(
                Fahrzeugklasse,
                fahrzeugklassenIds,
            );
            this.#logger.debug(
                'delete: deleteResultFahrzeugklassen=%o',
                deleteResultFahrzeugklassen,
            );
            deleteResult = await transactionalMgr.delete(Auto, id);
            this.#logger.debug('delete: deleteResult=%o', deleteResult);
        });

        return (
            deleteResult?.affected !== undefined &&
            deleteResult.affected !== null &&
            deleteResult.affected > 0
        );
    }

    async #validateCreate(auto: Auto): Promise<CreateError | undefined> {
        const validateResult = this.#validationService.validate(auto);
        if (validateResult !== undefined) {
            const messages = validateResult;
            this.#logger.debug('#validateCreate: messages=%o', messages);
            return { type: 'ConstraintViolations', messages };
        }

        const { marke } = auto;
        const autos = await this.#readService.find({ marke: marke }); // eslint-disable-line object-shorthand
        if (autos.length > 0) {
            return { type: 'MarkeExists', marke };
        }

        this.#logger.debug('#validateCreate: ok');
        return undefined;
    }

    async #validateUpdate(
        auto: Auto,
        id: string,
        versionStr: string,
    ): Promise<Auto | UpdateError> {
        const result = this.#validateVersion(versionStr);
        if (typeof result !== 'number') {
            return result;
        }

        const version = result;
        this.#logger.debug(
            '#validateUpdate: buch=%o, version=%s',
            auto,
            version,
        );

        const validateResult = this.#validationService.validate(auto);
        if (validateResult !== undefined) {
            const messages = validateResult;
            this.#logger.debug('#validateUpdate: messages=%o', messages);
            return { type: 'ConstraintViolations', messages };
        }

        const resultMarke = await this.#checkMarkeExists(auto);
        if (resultMarke !== undefined && resultMarke.id !== id) {
            return resultMarke;
        }

        const resultFindById = await this.#findByIdAndCheckVersion(id, version);
        this.#logger.debug('#validateUpdate: %o', resultFindById);
        return resultFindById;
    }

    #validateVersion(version: string | undefined): VersionInvalid | number {
        if (
            version === undefined ||
            !AutoWriteService.VERSION_PATTERN.test(version)
        ) {
            const error: VersionInvalid = { type: 'VersionInvalid', version };
            this.#logger.debug('#validateVersion: VersionInvalid=%o', error);
            return error;
        }

        return Number.parseInt(version.slice(1, -1), 10);
    }

    async #checkMarkeExists(auto: Auto): Promise<MarkeExists | undefined> {
        const { marke } = auto;

        const autos = await this.#readService.find({ marke: marke }); // eslint-disable-line object-shorthand
        if (autos.length > 0) {
            const [gefundenesAuto] = autos;
            const { id } = gefundenesAuto!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
            this.#logger.debug('#checkMarkeExists: id=%s', id);
            return { type: 'MarkeExists', marke, id: id! }; // eslint-disable-line @typescript-eslint/no-non-null-assertion
        }

        this.#logger.debug('#checkTitelExists: ok');
        return undefined;
    }

    async #findByIdAndCheckVersion(
        id: string,
        version: number,
    ): Promise<Auto | AutoNotExists | VersionOutdated> {
        const autoDb = await this.#readService.findById(id);
        if (autoDb === undefined) {
            const result: AutoNotExists = { type: 'AutoNotExists', id };
            this.#logger.debug('#checkIdAndVersion: AutoNotExists=%o', result);
            return result;
        }

        const versionDb = autoDb.version!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
        if (version < versionDb) {
            const result: VersionOutdated = {
                type: 'VersionOutdated',
                id,
                version,
            };
            this.#logger.debug(
                '#checkIdAndVersion: VersionOutdated=%o',
                result,
            );
            return result;
        }

        return autoDb;
    }
}
