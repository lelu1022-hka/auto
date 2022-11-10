import { afterAll, beforeAll, describe, test } from '@jest/globals';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import {
    host,
    httpsAgent,
    port,
    shutdownServer,
    startServer,
} from '../testserver.js';
import { HttpStatus } from '@nestjs/common';
import { loginRest } from '../login.js';

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
const id = '00000000-0000-0000-0000-000000000050';

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
// Test-Suite
// eslint-disable-next-line max-lines-per-function
describe('DELETE /autos', () => {
    let client: AxiosInstance;

    // Testserver starten und dabei mit der DB verbinden
    beforeAll(async () => {
        await startServer();
        const baseURL = `https://${host}:${port}/`;
        client = axios.create({
            baseURL,
            httpsAgent,
            validateStatus: (status) => status < 500, // eslint-disable-line @typescript-eslint/no-magic-numbers
        });
    });

    afterAll(async () => {
        await shutdownServer();
    });

    test('Vorhandenes Auto loeschen', async () => {
        // given
        const url = `/${id}`;
        const token = await loginRest(client);
        const headers = { Authorization: `Bearer ${token}` }; // eslint-disable-line @typescript-eslint/naming-convention

        // when
        const response: AxiosResponse<string> = await client.delete(url, {
            headers,
        });

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.NO_CONTENT);
        expect(data).toBeDefined();
    });

    test('Auto loeschen, aber ohne Token', async () => {
        // given
        const url = `/${id}`;

        // when
        const response: AxiosResponse<Record<string, any>> =
            await client.delete(url);

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.FORBIDDEN);
        expect(data.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    test('Auto loeschen, aber mit falschem Token', async () => {
        // given
        const url = `/${id}`;
        const token = 'FALSCH';
        const headers = { Authorization: `Bearer ${token}` }; // eslint-disable-line @typescript-eslint/naming-convention

        // when
        const response: AxiosResponse<Record<string, any>> =
            await client.delete(url, { headers });

        // then
        const { status, data } = response;

        expect(status).toBe(HttpStatus.FORBIDDEN);
        expect(data.statusCode).toBe(HttpStatus.FORBIDDEN);
    });
});
