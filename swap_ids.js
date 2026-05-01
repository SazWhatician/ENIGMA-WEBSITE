const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'team_data.json');
const rawData = fs.readFileSync(filePath, 'utf-8');
const data = JSON.parse(rawData);

// Interchange id 7 and 4
const member7 = data.team_members.find(m => m.id === 7);
const member4 = data.team_members.find(m => m.id === 4);
if (member7) member7.id = 4;
if (member4) member4.id = 7;

// Interchange id 9 and 8
const member9 = data.team_members.find(m => m.id === 9);
const member8 = data.team_members.find(m => m.id === 8);
if (member9) member9.id = 8;
if (member8) member8.id = 9;

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('Swapped IDs successfully.');
