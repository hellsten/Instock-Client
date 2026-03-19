import mysql from "mysql2/promise";
import fs from "node:fs/promises";

const database = process.env.DB_DATABASE || process.env.DB_NAME;
const shouldAutoSetup = process.env.AUTO_SETUP_DB === "true";
const shouldReset = process.env.DB_RESET === "true";
const setupFile = process.env.DB_SETUP_FILE || "./database/instock.sql";

async function setupDatabaseIfNeeded() {
    if (!shouldAutoSetup) return;

     if (!process.env.DB_HOST || !process.env.DB_USER || !database || process.env.DB_PASSWORD === undefined) {
        throw new Error("Missing DB env vars. Need DB_HOST, DB_USER, DB_PASSWORD, AND DB_DATABASE.");


    }
    const admin = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        multipleStatements: true,
    });
   
    try {
        if (shouldReset) {
            const sql = await fs.readFile(setupFile, "utf8");
            await admin.query(sql);
            console.log("DB reset from setup file")
            return;
        }

        const [rows] = await admin.query(
            "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?",
            [database]
        );

        const exists = rows.length > 0;
        if (!exists) {
            const sql = await fs.readFile(setupFile, "utf8");
            await admin.query(sql)
            console.log("DB created from setup file")
        } else {
            console.log('DB exists! skipping reset (DB_RESET=false)');
        }
    } finally {
        await admin.end();
    }

    
}

export default setupDatabaseIfNeeded;