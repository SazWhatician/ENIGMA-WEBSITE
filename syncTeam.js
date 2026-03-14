require('dotenv').config(); 
const { Client } = require('pg'); 

// Added the simplified image path for Saswat
const teamMembers = [
    { name: "Saswat Mohanty", role: "Apex", year: "2028", insta: "#", linkedin: "#", github: "#", img: "./team-assets/saswat.jpeg" },
    { name: "Samira Khan", role: "UI/UX", year: "2026", insta: "#", linkedin: "#", github: "#", img: "" },
    { name: "Jordan Lee", role: "Backend", year: "2027", insta: "#", linkedin: "#", github: "#", img: "" },
    { name: "Casey Smith", role: "Frontend", year: "2027", insta: "#", linkedin: "#", github: "#", img: "" },
    { name: "Taylor Swift", role: "Security", year: "2028", insta: "#", linkedin: "#", github: "#", img: "" },
    { name: "Morgan Page", role: "Cloud", year: "2028", insta: "#", linkedin: "#", github: "#", img: "" },
    { name: "Ada Lovelace", role: "Founder", year: "alumni", insta: "#", linkedin: "#", github: "#", img: "" },
    { name: "Alan Turing", role: "Core", year: "alumni", insta: "#", linkedin: "#", github: "#", img: "" }
];

async function syncTeamDatabase() {
    const DB_URL = process.env.DATABASE_URL; 
    console.log("🔍 Checking URL format:", DB_URL ? DB_URL.replace(/:[^:@]+@/, ':***@') : "UNDEFINED");
    
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
        console.log("🔄 Syncing team with PostgreSQL cloud...");
        
        // 1. Nuke the old table so we can rebuild it with the 'img' column
        await client.query('DROP TABLE IF EXISTS team_members;');

        // 2. Create the fresh table
        await client.query(`
            CREATE TABLE team_members (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255),
                role VARCHAR(255),
                year VARCHAR(50),
                insta VARCHAR(500),
                linkedin VARCHAR(500),
                github VARCHAR(500),
                img VARCHAR(500)
            );
        `);
        
        // 3. Insert the fresh data
        for (const member of teamMembers) {
            await client.query(
                'INSERT INTO team_members (name, role, year, insta, linkedin, github, img) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [member.name, member.role, member.year, member.insta, member.linkedin, member.github, member.img]
            );
        }
        
        console.log(`✅ SUCCESS: Permanently saved ${teamMembers.length} team members to the cloud database!`);
    } catch (err) {
        console.error("❌ ERROR:", err);
    } finally {
        await client.end();
    }
}

syncTeamDatabase();