const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.js') || file.endsWith('.jsx')) results.push(file);
        }
    });
    return results;
}

const files = walk('e:/app/store/frontend/src');
let changedCount = 0;

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');

    // We want to replace quotes to backticks and inject the env variable.
    // E.g. 'http://localhost:3001/api' -> `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`
    // E.g. `http://localhost:3001/api` -> `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`

    let newContent = content.replace(/(['"\`])http:\/\/localhost:3001(.*?)\1/g, (match, quote, rest) => {
        return `\`\${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${rest}\``;
    });

    if (content !== newContent) {
        fs.writeFileSync(f, newContent, 'utf8');
        changedCount++;
        console.log('Updated:', f);
    }
});

console.log(`Replaced in ${changedCount} files.`);
