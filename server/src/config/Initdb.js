import pg from 'pg';

const { Pool } = pg;
const databaseUrl = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: true,
  },
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

console.log('Database connection pool created successfully.');

export default pool;