/**
 * Das Modul enthält Objekte mit Daten aus Umgebungsvariablen.
 * @packageDocumentation
 */

import dotenv from 'dotenv';
import type pino from 'pino';
import process from 'node:process';

dotenv.config();

const {
    NODE_ENV,
    PORT,
    AUTO_SERVICE_HOST,
    AUTO_SERVICE_PORT,
    K8S_TLS,
    DB_TYPE,
    DB_NAME,
    DB_HOST,
    DB_USERNAME,
    DB_PASSWORD,
    DB_POPULATE,
    APOLLO_DEBUG,
    LOG_LEVEL,
    LOG_DIR,
    LOG_PRETTY,
    LOG_DEFAULT,
    HEALTH_PRETTY_PRINT,
    JWT_EXPIRES_IN,
    JWT_ISSUER,
    MAIL_HOST,
    MAIL_PORT,
    MAIL_LOG,
    USER_PASSWORD_ENCODED,
} = process.env; // eslint-disable-line n/no-process-env

interface NodeConfigEnv {
    readonly nodeEnv: string | undefined;
    readonly port: string | undefined;
    readonly serviceHost: string | undefined;
    readonly servicePort: string | undefined;
}

const nodeConfigEnv: NodeConfigEnv = {
    nodeEnv: NODE_ENV,
    port: PORT,
    serviceHost: AUTO_SERVICE_HOST,
    servicePort: AUTO_SERVICE_PORT,
};

interface ApolloConfigEnv {
    readonly debug: string | undefined;
}

const apolloConfigEnv: ApolloConfigEnv = {
    debug: APOLLO_DEBUG,
};

interface K8sConfigEnv {
    readonly tls: string | undefined;
}

const k8sConfigEnv: K8sConfigEnv = {
    tls: K8S_TLS,
};

interface HealthConfigEnv {
    readonly prettyPrint: string | undefined;
}

const healthConfigEnv: HealthConfigEnv = {
    prettyPrint: HEALTH_PRETTY_PRINT,
};

interface DbConfigEnv {
    readonly type: string | undefined;
    readonly name: string | undefined;
    readonly host: string | undefined;
    readonly username: string | undefined;
    readonly password: string | undefined;
    readonly populate: string | undefined;
}

const dbConfigEnv: DbConfigEnv = {
    type: DB_TYPE,
    name: DB_NAME,
    host: DB_HOST,
    username: DB_USERNAME,
    password: DB_PASSWORD,
    populate: DB_POPULATE,
};

interface AuthConfigEnv {
    readonly expiresIn: string;
    readonly issuer: string;
    readonly password: string;
}

const authConfigEnv: AuthConfigEnv = {
    expiresIn: JWT_EXPIRES_IN ?? '1h',
    issuer: JWT_ISSUER ?? 'https://hka.de/JuergenZimmermann',
    password: USER_PASSWORD_ENCODED ?? '! To Be Changed !',
};

interface LogConfigEnv {
    readonly logLevel: pino.Level | undefined;
    readonly logDir: string | undefined;
    readonly pretty: boolean;
    readonly defaultValue: boolean;
}

const logConfigEnv: LogConfigEnv = {
    logLevel: LOG_LEVEL as pino.Level | undefined,
    logDir: LOG_DIR === undefined ? LOG_DIR : LOG_DIR.trimEnd(),
    pretty: LOG_PRETTY?.toLowerCase() === 'true',
    defaultValue: LOG_DEFAULT?.toLowerCase() === 'true',
};

interface MailConfigEnv {
    readonly host: string | undefined;
    readonly port: string | undefined;
    readonly log: string | undefined;
}

const mailConfigEnv: MailConfigEnv = {
    host: MAIL_HOST,
    port: MAIL_PORT,
    log: MAIL_LOG,
};

interface Env {
    nodeConfigEnv: NodeConfigEnv;
    apolloConfigEnv: ApolloConfigEnv;
    k8sConfigEnv: K8sConfigEnv;
    healthConfigEnv: HealthConfigEnv;
    dbConfigEnv: DbConfigEnv;
    authConfigEnv: AuthConfigEnv;
    logConfigEnv: LogConfigEnv;
    mailConfigEnv: MailConfigEnv;
}

/**
 * Eingelesene Umgebungsvariable
 */
export const env: Env = {
    nodeConfigEnv,
    apolloConfigEnv,
    k8sConfigEnv,
    healthConfigEnv,
    dbConfigEnv,
    authConfigEnv,
    logConfigEnv,
    mailConfigEnv,
};
