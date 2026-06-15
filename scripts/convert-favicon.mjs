import fs from 'fs';
import path from 'path';

const root = process.cwd();
const inFile = path.join(root, 'haricious_logo.png');
const outFile = path.join(root, 'public', 'haricious_logo.webp');

async function main() {
  if (!fs.existsSync(inFile)) {
    console.error('Input PNG not found:', inFile);
    process.exit(1);
  }

  try {
    const { default: sharp } = await import('sharp');
    await sharp(inFile).resize({ width: 256 }).webp({ quality: 80 }).toFile(outFile);
    console.log('Wrote', outFile);
  } catch (err) {
    console.error('sharp not available or conversion failed. Install sharp and try again.');
    console.error(err.message || err);
    process.exit(1);
  }
}

main();
