//DRINGEND TESTEN!!!!!
/**
 * Das Modul besteht aus der Klasse {@linkcode AutoValidationService}.
 * @packageDocumentation
 */

import Ajv2020 from 'ajv/dist/2020.js';
import { type Auto } from '../entity/auto.entity.js';
import { Injectable } from '@nestjs/common';
import RE2 from 're2';
import ajvErrors from 'ajv-errors';
import formatsPlugin from 'ajv-formats';
import { getLogger } from '../../logger/logger.js';
import { jsonSchema } from './jsonSchema.js';

export const ID_PATTERN = new RE2(
    '^[\\dA-Fa-f]{8}-[\\dA-Fa-f]{4}-[\\dA-Fa-f]{4}-[\\dA-Fa-f]{4}-[\\dA-Fa-f]{12}$',
);
@Injectable()
export class AutoValidationService {
    #ajv = new Ajv2020({
        allowUnionTypes: true,
        allErrors: true,
    });

    readonly #logger = getLogger(AutoValidationService.name);

    constructor() {
        formatsPlugin(this.#ajv, ['date', 'email', 'uri']);
        ajvErrors(this.#ajv);
    }

    validateId(id: string) {
        return ID_PATTERN.test(id);
    }

    /**
     * Funktion zur Validierung, wenn neue Autos angelegt oder vorhandene Autos
     * aktualisiert bzw. überschrieben werden sollen.
     */
    validate(auto: Auto) {
        this.#logger.debug('validate: auto=%o', auto);
        const validate = this.#ajv.compile<Auto>(jsonSchema);
        validate(auto);

        const errors = validate.errors ?? [];
        const messages = errors
            .map((error) => error.message)
            .filter((msg) => msg !== undefined);
        this.#logger.debug(
            'validate: errors=%o, messages=%o',
            errors,
            messages,
        );
        return messages.length > 0 ? (messages as string[]) : undefined;
    }
}
