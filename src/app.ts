const express = require ("express");
import {Pool}  from "pg";
import { config } from 'dotenv';
const app = express();
const port = 3000;

config();
const pool = new Pool({//configuracion de db
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: 5432
});

pool.connect()
.then(() => {
    console.log("Conectado a la base de posgres");
})
.catch((err)=>{
    console.log("Error de conexion a la base de datos", err);
});

app.get('/', async (req,res) =>{
    try {
        const client = await pool.connect();
        //const result = await client.query('SELECT * FROM mangus.users');
        //const result = await client.query('SELECT * FROM public.parameter_values'); 
        const result = await client.query("SELECT * FROM public.parameter_values WHERE id = 'PathResOrigVide'"); 
        const parametro = result.rows[0]; 
        const valor1 = parametro.value1;
        console.log("parametro", valor1);
        client.release();
        res.json(result.rows);
    } catch (error) {
        console.log("error peticion", error);
    }
});
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});

