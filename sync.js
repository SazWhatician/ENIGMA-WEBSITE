require('dotenv').config(); // Add this at the top
const { Client } = require('pg');

const projects = [
    { title: "eNIGGmA", desc: "2 things you maybe wanna ride", img: "./project-assets/03ebb93dc76d5da51b66fa1826d3c548.jpg", link: "https://www.instagram.com/iamsazwat/?hl=en" },
    { title: "Kanye West", desc: "aesthetic cd picture from pinterest", img: "./project-assets/1937c631f87b36cdab243f6fe4d0bc07.jpg", link: "#" },
    { title: "TAWSAS", desc: "Saswat means someone who's Eternal- never ending", img: "./project-assets/abcba71e1e62c9efb1e98b462058ce4c.jpg", link: "https://www.google.com/?zx=1773264614308&no_sw_cr=1" },
    { title: "AmGGINe", desc: "for the girls: 2 things you maybe wanna ride", img: "./project-assets/bc06fb92df284696e7191a5b781b97f4.jpg", link: "#" },
    { title: "Tyler- the creator", desc: "Tyler is really cool", img: "./project-assets/d7d287744fcbefbba4c0db2ac389cf2b.jpg", link: "#" }
];

async function syncDatabase() {
    // Now it ONLY looks for the secure environment variable
    const DB_URL = process.env.DATABASE_URL; 
    
    if (!DB_URL) {
        console.error("❌ ERROR: DATABASE_URL is missing. Check your .env file.");
        return;
    }

    const client = new Client({ 
        connectionString: DB_URL,
        ssl: DB_URL.includes('localhost') ? false : { rejectUnauthorized: false }
    });
    
    await client.connect();

    try {
        console.log("🔄 Syncing with PostgreSQL cloud...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS projects (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255),
                "desc" TEXT,
                img VARCHAR(500),
                link VARCHAR(500)
            );
        `);
        await client.query('TRUNCATE TABLE projects RESTART IDENTITY;');

        for (const proj of projects) {
            await client.query(
                'INSERT INTO projects (title, "desc", img, link) VALUES ($1, $2, $3, $4)',
                [proj.title, proj.desc, proj.img, proj.link]
            );
        }
        console.log(`✅ SUCCESS: Permanently saved ${projects.length} projects to the cloud database!`);
    } catch (err) {
        console.error("❌ ERROR:", err);
    } finally {
        await client.end();
    }
}

syncDatabase();