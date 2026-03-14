require('dotenv').config(); 
const { Client } = require('pg'); 

// Add Team Members here:
const teamMembers = [
    { name: "Saswat Mohanty", role: "Apex", year: "2028", insta: "#", linkedin: "#", github: "#" },
    { name: "AnkPriNay", role: "UI/UX", year: "2026", insta: "#", linkedin: "#", github: "#" },
    { name: "Jordan Lee", role: "Backend", year: "2027", insta: "#", linkedin: "#", github: "#" },
    { name: "Casey Smith", role: "Frontend", year: "2027", insta: "#", linkedin: "#", github: "#" },
    { name: "Taylor Swift", role: "Security", year: "2028", insta: "#", linkedin: "#", github: "#" },
    { name: "Morgan Page", role: "Cloud", year: "2028", insta: "#", linkedin: "#", github: "#" },
    { name: "Ada Lovelace", role: "Founder", year: "alumni", insta: "#", linkedin: "#", github: "#" },
    { name: "Alan Turing", role: "Core", year: "alumni", insta: "#", linkedin: "#", github: "#" }
];

async function syncTeamDatabase() {
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
        console.log("🔄 Syncing team with PostgreSQL cloud...");
        
        // 1. Create the team_members table
        await client.query(`
            CREATE TABLE IF NOT EXISTS team_members (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255),
                role VARCHAR(255),
                year VARCHAR(50),
                insta VARCHAR(500),
                linkedin VARCHAR(500),
                github VARCHAR(500)
            );
        `);
        
        // 2. Clear out any old data and reset the ID counter
        await client.query('TRUNCATE TABLE team_members RESTART IDENTITY;');

        // 3. Insert the fresh data
        for (const member of teamMembers) {
            await client.query(
                'INSERT INTO team_members (name, role, year, insta, linkedin, github) VALUES ($1, $2, $3, $4, $5, $6)',
                [member.name, member.role, member.year, member.insta, member.linkedin, member.github]
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