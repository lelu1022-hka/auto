/**
 * Das Modul enthält die Konfiguration für den Zugriff auf die DB.
 * @packageDocumentation
 */

import { Auto } from '../auto/entity/auto.entity.js';
import { Fahrzeugklasse } from '../auto/entity/fahrzeugklasse.entity.js';
import { type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { env } from './env.js';
import { k8sConfig } from './kubernetes.js';
import { nodeConfig } from './node.js';

const { dbConfigEnv } = env;

// nullish coalescing
const database = dbConfigEnv.name ?? Auto.name.toLowerCase();
const { detected } = k8sConfig;
const dbType =
    dbConfigEnv.type === undefined || dbConfigEnv.type === 'postgres'
        ? 'postgres'
        : 'mysql';
const host = detected ? dbType : dbConfigEnv.host ?? 'localhost';
const username = dbConfigEnv.username ?? Auto.name.toLowerCase();
const pass = dbConfigEnv.password ?? 'p';

export const typeOrmModuleOptions: TypeOrmModuleOptions =
    dbType === 'postgres'
        ? {
              type: 'postgres',
              host,
              port: 5432,
              username,
              password: pass,
              database,
              entities: [Auto, Fahrzeugklasse],
              logging:
                  nodeConfig.nodeEnv === 'development' ||
                  nodeConfig.nodeEnv === 'test',
              logger: 'advanced-console',
          }
        : {
              type: 'mysql',
              host,
              port: 3306,
              username,
              password: pass,
              database,
              entities: [Auto, Fahrzeugklasse],
              supportBigNumbers: true,
              logging:
                  nodeConfig.nodeEnv === 'development' ||
                  nodeConfig.nodeEnv === 'test',
              logger: 'advanced-console',
          };

const { password, ...typeOrmModuleOptionsLog } = typeOrmModuleOptions;
console.info('typeOrmModuleOptions: %o', typeOrmModuleOptionsLog);

export const dbPopulate = dbConfigEnv.populate?.toLowerCase() === 'true';
