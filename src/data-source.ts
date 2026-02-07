import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'path';

const migrationsPath = join(__dirname, 'migrations', '*{.ts,.js}');
const entitiesPath = join(__dirname, '**', '*.entity{.ts,.js}');

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [entitiesPath],
  migrations: [migrationsPath],
  synchronize: false,
  ssl: process.env.DATABASE_SSL === 'true'
    ? { rejectUnauthorized: false }
    : undefined,
});

export default AppDataSource;
export { AppDataSource };
