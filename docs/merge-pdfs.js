import PDFMerger from 'pdf-merger-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';

// Get current file path in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function mergePDFs() {
  const merger = new PDFMerger();
  
  // Directory containing the PDFs
  const pdfDir = join(__dirname, 'PDF_Documentation');
  
  // Get all PDF files and sort them by name
  const pdfFiles = readdirSync(pdfDir)
    .filter(file => file.endsWith('.pdf'))
    .sort((a, b) => {
      // Extract the number prefix from the filename (00_, 01_, etc.)
      const numA = parseInt(a.match(/^(\d+)_/)[1]);
      const numB = parseInt(b.match(/^(\d+)_/)[1]);
      return numA - numB;
    });
  
  console.log('Merging PDFs in the following order:');
  pdfFiles.forEach(file => console.log(`- ${file}`));
  
  // Add each PDF to the merger
  for (const file of pdfFiles) {
    await merger.add(join(pdfDir, file));
  }
  
  // Save the merged PDF
  await merger.save(join(__dirname, 'FalsoPay_Documentation.pdf'));
  
  console.log('PDFs merged successfully to FalsoPay_Documentation.pdf');
}

mergePDFs().catch(err => console.error('Error merging PDFs:', err)); 