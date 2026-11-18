const fs = require('node:fs');
const path = require('node:path');

const siteUrl = 'https://iam-a-fish.github.io/';
const works = JSON.parse(fs.readFileSync(path.join(__dirname, 'works.json'), 'utf8'));
const outputDirectory = path.join(__dirname, 'share');

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getDescription(work) {
    if (typeof work.description === 'string' && work.description.trim()) {
        return work.description.trim();
    }

    const tags = Array.isArray(work.tags) ? work.tags.join('・') : '';
    return tags
        ? `「${work.title}」の作品紹介です。${tags}`
        : `「${work.title}」の作品紹介です。`;
}

fs.mkdirSync(outputDirectory, { recursive: true });

const filenames = new Set();
works.forEach((work, index) => {
    const filename = `work-${index}.html`;
    filenames.add(filename);
    const pageUrl = new URL(`share/${filename}`, siteUrl).href;
    const detailUrl = new URL(`#work-${index}`, siteUrl).href;
    const imagePath = String(work.image || 'assets/images/favicon.png').replace(/\\/g, '/');
    const imageUrl = new URL(imagePath, siteUrl).href;
    const title = `${work.title} | さかなのさいと`;
    const description = getDescription(work);

    const redirectTarget = JSON.stringify(detailUrl);
    const html = `<!doctype html><html lang="ja"><meta charset="utf-8"><meta property="og:type" content="website"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${escapeHtml(pageUrl)}"><meta property="og:image" content="${escapeHtml(imageUrl)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${escapeHtml(imageUrl)}"><title>${escapeHtml(title)}</title><a href="${escapeHtml(detailUrl)}">ポートフォリオで作品を見る</a><script>window.location.replace(${redirectTarget})</script></html>\n`;

    fs.writeFileSync(path.join(outputDirectory, filename), html);
});

for (const filename of fs.readdirSync(outputDirectory)) {
    if (/^work-\d+\.html$/.test(filename) && !filenames.has(filename)) {
        fs.unlinkSync(path.join(outputDirectory, filename));
    }
}

console.log(`Generated ${works.length} share preview pages.`);
