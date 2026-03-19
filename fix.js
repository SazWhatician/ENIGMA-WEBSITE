const fs = require('fs');

function processFile(file) {
    let content = fs.readFileSync(file, 'utf8');
    let parts = content.split('</main>');
    if (parts.length > 1) {
        let head = parts[0] + '</main>\n\n';
        let newTail = '    <script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script>\n    <script src="./js/common.js"></script>\n</body>\n\n</html>';
        fs.writeFileSync(file, head + newTail);
        console.log("Processed", file);
    }
}

processFile('project.html');
processFile('team.html');

let contact = fs.readFileSync('contact.html', 'utf8');
let cParts = contact.split('})();');
if (cParts.length > 1) {
    let cHead = cParts[0] + '})();\n    </script>\n    <script src="./js/common.js"></script>\n</body>\n\n</html>';
    fs.writeFileSync('contact.html', cHead);
    console.log("Processed contact.html");
}
