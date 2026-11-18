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

    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${escapeHtml(description)}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="さかなのさいと">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${escapeHtml(pageUrl)}">
    <meta property="og:image" content="${escapeHtml(imageUrl)}">
    <meta property="og:image:alt" content="${escapeHtml(work.title)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}">
    <link rel="canonical" href="${escapeHtml(pageUrl)}">
    <title>${escapeHtml(title)}</title>
    <style>
        body { box-sizing: border-box; max-width: 760px; margin: 0 auto; padding: 32px 20px; color: #222; font-family: sans-serif; line-height: 1.7; }
        img { display: block; width: 100%; max-height: 480px; margin: 20px 0; object-fit: contain; background: #f7f9fa; }
        a { display: inline-block; padding: 10px 18px; border-radius: 6px; background: #aaccee; color: #111; font-weight: bold; text-decoration: none; }
    </style>
</head>
<body>
    <main>
        <h1>${escapeHtml(work.title)}</h1>
        <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(work.title)}">
        <p>${escapeHtml(description)}</p>
        <a href="${escapeHtml(detailUrl)}">ポートフォリオで作品を見る</a>
    </main>
    <script>window.location.replace(${JSON.stringify(detailUrl)});</script>
</body>
</html>
`;

    fs.writeFileSync(path.join(outputDirectory, filename), html);
});

for (const filename of fs.readdirSync(outputDirectory)) {
    if (/^work-\d+\.html$/.test(filename) && !filenames.has(filename)) {
        fs.unlinkSync(path.join(outputDirectory, filename));
    }
}

console.log(`Generated ${works.length} share preview pages.`);
