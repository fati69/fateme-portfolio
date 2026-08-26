import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8900;

const app = express();

app.use(
  express.static(__dirname, {
    index: 'index.html',
    setHeaders(res, filePath) {
      if (filePath.endsWith('.html') || /\.(png|jpe?g|webp|gif|svg)$/i.test(filePath)) {
        res.setHeader('Cache-Control', 'no-store');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=3600');
      }
    },
  })
);

app.listen(PORT, () => {
  console.log('');
  console.log('  archive-portfolio (Figma Archive static site)');
  console.log(`  → http://localhost:${PORT}`);
  console.log('');
});
