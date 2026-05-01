const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public');
const files = ['index.html', 'events.html', 'contact.html', 'team.html', 'project.html'];

const oldSnippet = `
    <!-- FOOTER TEXT -->
    <div style="width: 100%; text-align: center; padding: 20px 0; font-family: 'Syncopate', sans-serif; font-size: 10px; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; letter-spacing: 2px; position: relative; z-index: 1000; bottom: 0; background: transparent; pointer-events: none;">
        made with love: Saswat kumar mohanty @Enigma
    </div>
`;

const newSnippet = `
    <!-- FOOTER TEXT -->
    <div style="width: 100%; text-align: center; padding: 20px 0; font-family: 'Syncopate', sans-serif; font-size: 7px; color: rgba(255, 255, 255, 0.15); text-transform: uppercase; letter-spacing: 2px; position: relative; z-index: 1000; bottom: 0; background: transparent; pointer-events: none;">
        made with love: Saswat kumar mohanty @Enigma
    </div>
`;

for (let file of files) {
    let filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf-8');

    // First, remove the old snippet completely if it exists
    if (content.includes(oldSnippet)) {
        content = content.replace(oldSnippet, '');
    }
    // Also remove newSnippet if it was already applied (for idempotency)
    if (content.includes(newSnippet)) {
        content = content.replace(newSnippet, '');
    }

    // Now decide if we should add it back
    if (['index.html', 'events.html', 'contact.html'].includes(file)) {
        // Add the new snippet before </body>
        content = content.replace('</body>', newSnippet + '\n</body>');
        console.log(`Updated and styled footer in ${file}`);
    } else {
        console.log(`Removed footer from ${file}`);
    }

    fs.writeFileSync(filePath, content);
}
