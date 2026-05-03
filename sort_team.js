const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./team_data.json', 'utf8'));
const members = data.team_members;

// Separate by year
const y2026 = members.filter(m => m.year === '2026').sort((a, b) => a.name.trim().localeCompare(b.name.trim()));
const y2027 = members.filter(m => m.year === '2027').sort((a, b) => a.name.trim().localeCompare(b.name.trim()));
const y2028 = members.filter(m => m.year === '2028').sort((a, b) => a.name.trim().localeCompare(b.name.trim()));

// Combine: 2026 first, then 2027, then 2028
const sorted = [...y2026, ...y2027, ...y2028];

// Assign sequential IDs starting from 1
sorted.forEach((m, i) => { m.id = i + 1; });

console.log(`2026: ${y2026.length} members (IDs 1-${y2026.length})`);
console.log(`2027: ${y2027.length} members (IDs ${y2026.length + 1}-${y2026.length + y2027.length})`);
console.log(`2028: ${y2028.length} members (IDs ${y2026.length + y2027.length + 1}-${sorted.length})`);
console.log(`Total: ${sorted.length}`);

// Write back
fs.writeFileSync('./team_data.json', JSON.stringify({ team_members: sorted }, null, 2) + '\n');
console.log('Done! team_data.json updated.');
