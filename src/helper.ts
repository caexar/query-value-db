import { Pool, QueryResult, Client } from 'pg';
import { config } from 'dotenv';
config();
// Configuración de la base de datos
const dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: 5432
};

async function getValueParameter(id: string): Promise<QueryResult> {
    const client = new Client(dbConfig);
    await client.connect();
  
    const query = "SELECT * FROM public.parameter_values WHERE id = $1";
    const values = [id];
  
    try {
      const result = await client.query(query, values);
      const resultParameter = result.rows[0].value1; 
      return resultParameter;
    } catch (error) {
      throw error;
    } finally {
      await client.end();
    }
  }
  
  export { getValueParameter };
