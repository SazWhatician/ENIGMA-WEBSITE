const fs = require('fs');
['public/events.html', 'public/contact.html'].forEach(f => {
    if(fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf-8');
        content = content.replace('<script src="./js/footer.js"></script>', '');
        fs.writeFileSync(f, content);
    }
});
