const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const snippet = `
    <!-- FOOTER TEXT -->
    <div style="width: 100%; text-align: center; padding: 20px 0; font-family: 'Syncopate', sans-serif; font-size: 10px; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; letter-spacing: 2px; position: relative; z-index: 1000; bottom: 0; background: transparent; pointer-events: none;">
        made with love: Saswat kumar mohanty @Enigma
    </div>
`;

for (let file of files) {
    let filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    if (content.includes("made with love: Saswat kumar mohanty")) {
        console.log(`Skipping ${file}`);
        continue;
    }
    
    // Replace </body> with the snippet followed by </body>
    if (content.includes('</body>')) {
        content = content.replace('</body>', snippet + '\n</body>');
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file}`);
    }
}
