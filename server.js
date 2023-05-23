import express from "express";
import pg from 'pg';
import routes from "./routes/routes.js";

const { Pool } = pg;
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(routes);

export const pool = new Pool({
    host: '127.0.0.1',
    user: 'postgres',
    database: 'dbportafolio',
    password: '1234',
    port: 5432
});

app.listen(4000);

export default pool;