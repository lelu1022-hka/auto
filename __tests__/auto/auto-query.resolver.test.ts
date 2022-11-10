import { type GraphQLRequest, type GraphQLResponse } from 'apollo-server-types';
import { afterAll, beforeAll, describe, test } from '@jest/globals';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import {
    host,
    httpsAgent,
    port,
    shutdownServer,
    startServer,
} from '../testserver.js';
import { type AutoDTO } from '../../src/auto/graphql/auto-query.resolver.js';
import { HttpStatus } from '@nestjs/common';
import each from 'jest-each';

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
const idVorhanden = [
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
];

const markeVorhanden = ['Alpha', 'Beta', 'Gamma'];

const teilMarkeVorhanden = ['a', 't', 'g'];

const teilMarkeNichtVorhanden = ['Xyz', 'abc'];

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
// Test-Suite
// eslint-disable-next-line max-lines-per-function
describe('GraphQL Queries', () => {
    let client: AxiosInstance;
    const graphqlPath = 'graphql';

    // Testserver starten und dabei mit der DB verbinden
    beforeAll(async () => {
        await startServer();
        const baseURL = `https://${host}:${port}/`;
        client = axios.create({
            baseURL,
            httpsAgent,
        });
    });

    afterAll(async () => {
        await shutdownServer();
    });

    each(idVorhanden).test('Auto zu vorhandener ID %s', async (id: string) => {
        // given
        const body: GraphQLRequest = {
            query: `
                {
                    auto(id: "${id}") {
                        marke
                        typ
                        version
                    }
                }
            `,
        };

        // when
        const response: AxiosResponse<GraphQLResponse> = await client.post(
            graphqlPath,
            body,
        );

        // then
        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.errors).toBeUndefined();
        expect(data.data).toBeDefined();

        const { auto } = data.data!;
        const result: AutoDTO = auto;

        expect(result.marke).toMatch(/^\w/u);
        expect(result.version).toBeGreaterThan(-1);
        expect(result.id).toBeUndefined();
    });

    test('Auto zu nicht-vorhandener ID', async () => {
        // given
        const id = '999999999999999999999999';
        const body: GraphQLRequest = {
            query: `
                {
                    auto(id: "${id}") {
                        marke
                    }
                }
            `,
        };

        // when
        const response: AxiosResponse<GraphQLResponse> = await client.post(
            graphqlPath,
            body,
        );

        // then
        const { status, headers, data } = response;

        expect(status).toBe(HttpStatus.OK);
        expect(headers['content-type']).toMatch(/json/iu);
        expect(data.data!.auto).toBeNull();

        const { errors } = data;

        expect(errors).toHaveLength(1);

        const [error] = errors!;
        const { message, path, extensions } = error!;

        expect(message).toBe(`Es wurde kein Auto mit der ID ${id} gefunden.`);
        expect(path).toBeDefined();
        expect(path!![0]).toBe('auto');
        expect(extensions).toBeDefined();
        expect(extensions!.code).toBe('BAD_USER_INPUT');
    });

    each(markeVorhanden).test(
        'Auto zu vorhandenem Titel %s',
        async (marke: string) => {
            // given
            const body: GraphQLRequest = {
                query: `
                    {
                        autos(marke: "${marke}") {
                            marke
                            typ
                        }
                    }
                `,
            };

            // when
            const response: AxiosResponse<GraphQLResponse> = await client.post(
                graphqlPath,
                body,
            );

            // then
            const { status, headers, data } = response;

            expect(status).toBe(HttpStatus.OK);
            expect(headers['content-type']).toMatch(/json/iu);
            expect(data.errors).toBeUndefined();

            expect(data.data).toBeDefined();

            const { autos } = data.data!;

            expect(autos).not.toHaveLength(0);

            const autosArray: AutoDTO[] = autos;

            expect(autosArray).toHaveLength(1);

            const [auto] = autosArray;

            expect(auto!.marke).toBe(marke);
        },
    );

    each(teilMarkeVorhanden).test(
        'Auto zu vorhandener Teil-Marke %s',
        async (teilMarke: string) => {
            // given
            const body: GraphQLRequest = {
                query: `
                    {
                        autos(marke: "${teilMarke}") {
                            marke
                            typ
                        }
                    }
                `,
            };

            // when
            const response: AxiosResponse<GraphQLResponse> = await client.post(
                graphqlPath,
                body,
            );

            // then
            const { status, headers, data } = response;

            expect(status).toBe(HttpStatus.OK);
            expect(headers['content-type']).toMatch(/json/iu);
            expect(data.errors).toBeUndefined();
            expect(data.data).toBeDefined();

            const { autos } = data.data!;

            expect(autos).not.toHaveLength(0);

            const autosArray: AutoDTO[] = autos;
            autosArray
                .map((auto) => auto.marke)
                .forEach((marke: string) =>
                    expect(marke.toLowerCase()).toEqual(
                        expect.stringContaining(teilMarke),
                    ),
                );
        },
    );

    each(teilMarkeNichtVorhanden).test(
        'Auto zu nicht vorhandener Marke %s',
        async (teilMarke: string) => {
            // given
            const body: GraphQLRequest = {
                query: `
                    {
                        autos(marke: "${teilMarke}") {
                            marke
                            typ
                        }
                    }
                `,
            };

            // when
            const response: AxiosResponse<GraphQLResponse> = await client.post(
                graphqlPath,
                body,
            );

            // then
            const { status, headers, data } = response;

            expect(status).toBe(HttpStatus.OK);
            expect(headers['content-type']).toMatch(/json/iu);
            expect(data.data!.autos).toBeNull();

            const { errors } = data;

            expect(errors).toHaveLength(1);

            const [error] = errors!;
            const { message, path, extensions } = error!;

            expect(message).toBe('Es wurden keine Autos gefunden.');
            expect(path).toBeDefined();
            expect(path!![0]).toBe('autos');
            expect(extensions).toBeDefined();
            expect(extensions!.code).toBe('BAD_USER_INPUT');
        },
    );
});
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-extra-non-null-assertion */
