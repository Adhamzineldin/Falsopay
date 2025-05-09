#!/usr/bin/env node

/**
 * FalsoPay Enhanced Documentation Generator
 * 
 * This script converts Markdown files to professional PDF documents
 * using Pandoc with custom styling and post-processing.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const PDFMerger = require('pdf-merger-js');
const qrcode = require('qrcode');
const { program } = require('commander');

// Define configuration
const config = {
  sourceDir: path.join(__dirname, 'PDF_Documentation'),
  outputDir: path.join(__dirname, 'Enhanced_Documentation'),
  templateFile: path.join(__dirname, 'falsopay-pdf-template.css'),
  headerLogo: path.join(__dirname, 'assets', 'falsopay-header-logo.png'),
  footerTemplate: path.join(__dirname, 'templates', 'footer-template.html'),
  watermark: false,
  logoPath: path.join(__dirname, 'assets', 'falsopay-logo.png'),
  fontDir: path.join(__dirname, 'assets', 'fonts'),
  tempDir: path.join(__dirname, 'temp'),
  merged: {
    filename: 'FalsoPay_Enhanced_Documentation.pdf',
    bookmarks: true,
    outlines: true,
    metadata: {
      title: 'FalsoPay System Documentation',
      author: 'FalsoPay Development Team',
      subject: 'Secure Financial Technology System',
      keywords: 'fintech, payment, banking, security, software engineering',
      creator: 'FalsoPay Documentation Generator'
    }
  }
};

// Ensure directories exist
for (const dir of [config.outputDir, config.tempDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Command-line interface setup
program
  .name('generate-enhanced-docs')
  .description('Generate professional PDF documentation for FalsoPay')
  .version('1.0.0')
  .option('-s, --source <directory>', 'Source directory containing Markdown files', config.sourceDir)
  .option('-o, --output <directory>', 'Output directory for generated PDFs', config.outputDir)
  .option('-c, --css <file>', 'Custom CSS template file', config.templateFile)
  .option('-w, --watermark', 'Add watermark to PDFs', config.watermark)
  .option('-m, --merge', 'Merge all PDFs into a single document', true)
  .option('-v, --verbose', 'Show verbose output')
  .parse(process.argv);

const options = program.opts();
// Override config with command-line options
Object.assign(config, options);

// Log configuration when in verbose mode
if (options.verbose) {
  console.log('Configuration:', JSON.stringify(config, null, 2));
}

/**
 * Generate QR codes for linking to resources
 */
async function generateQRCodes() {
  if (options.verbose) console.log('Generating QR codes...');
  
  const qrCodes = {
    github: 'https://github.com/yourusername/falsopay',
    documentation: 'https://docs.falsopay.com',
    api: 'https://api.falsopay.com/docs'
  };
  
  const qrDir = path.join(config.tempDir, 'qrcodes');
  if (!fs.existsSync(qrDir)) {
    fs.mkdirSync(qrDir, { recursive: true });
  }
  
  for (const [name, url] of Object.entries(qrCodes)) {
    const qrPath = path.join(qrDir, `${name}.png`);
    await qrcode.toFile(qrPath, url, {
      color: {
        dark: '#0E4C92',
        light: '#ffffff'
      },
      width: 200,
      margin: 1
    });
    
    if (options.verbose) console.log(`Generated QR code for ${name} at ${qrPath}`);
  }
  
  return qrDir;
}

/**
 * Process and enhance a Markdown file with additional features
 */
function enhanceMarkdown(filePath) {
  if (options.verbose) console.log(`Enhancing Markdown file: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add appropriate cover page class to the main title if it's a cover sheet
  if (filePath.includes('00_Cover_Sheet')) {
    content = content.replace('# FalsoPay System Documentation', '<div class="cover-page">\n\n# FalsoPay System Documentation');
    content += '\n\n</div>';
  }
  
  // Add section dividers for main sections
  if (filePath.match(/\d+_[^\/]+\.md$/)) {
    const sectionNumber = path.basename(filePath).match(/^(\d+)_/)[1];
    const sectionName = path.basename(filePath).replace(/^\d+_/, '').replace('.md', '');
    
    if (sectionNumber !== '00' && sectionNumber !== '01') {  // Skip cover and TOC
      const sectionTitle = sectionName.replace(/_/g, ' ');
      const divider = `<div class="section-divider">\n\n# ${sectionTitle}\n\n</div>\n\n`;
      content = divider + content;
    }
  }
  
  // Add info boxes, warning boxes, etc.
  content = content
    .replace(/>\s*\[!NOTE\]\s*\n>(.*?)(?=\n\n)/gms, '<div class="info-box">\n\n$1\n\n</div>')
    .replace(/>\s*\[!WARNING\]\s*\n>(.*?)(?=\n\n)/gms, '<div class="warning-box">\n\n$1\n\n</div>')
    .replace(/>\s*\[!TIP\]\s*\n>(.*?)(?=\n\n)/gms, '<div class="best-practice">\n\n$1\n\n</div>')
    .replace(/>\s*\[!TECHNICAL\]\s*\n>(.*?)(?=\n\n)/gms, '<div class="technical-note">\n\n$1\n\n</div>');
  
  // Enhanced table styling with automatic zebra striping
  content = content.replace(/\|[\s\-:]+\|/g, (match) => {
    return match.replace(/-/g, '—'); // Use em dashes for better table display
  });
  
  const enhancedFilePath = path.join(config.tempDir, path.basename(filePath));
  fs.writeFileSync(enhancedFilePath, content, 'utf8');
  
  if (options.verbose) console.log(`Enhanced Markdown saved to: ${enhancedFilePath}`);
  
  return enhancedFilePath;
}

/**
 * Convert a Markdown file to PDF using Pandoc with our custom styling
 */
function convertToPDF(markdownPath, pdfPath) {
  if (options.verbose) console.log(`Converting ${markdownPath} to PDF...`);
  
  const pandocArgs = [
    '--pdf-engine=wkhtmltopdf',
    `--css=${config.templateFile}`,
    '--metadata=lang:en-US',
    '--toc',
    '--toc-depth=3',
    '--number-sections',
    `--include-in-header=${config.headerLogo ? `"${config.headerLogo}"` : ''}`,
    `--include-before-body=${config.footerTemplate ? `"${config.footerTemplate}"` : ''}`,
    '--highlight-style=breezedark',
    '--variable=colorlinks',
    '--variable=urlcolor=blue',
    '-V geometry:margin=1in',
    '-o', `"${pdfPath}"`,
    `"${markdownPath}"`
  ];
  
  if (config.watermark) {
    pandocArgs.push('--variable=watermark:draft');
  }
  
  const pandocCommand = `pandoc ${pandocArgs.join(' ')}`;
  
  try {
    if (options.verbose) console.log(`Executing: ${pandocCommand}`);
    execSync(pandocCommand, { stdio: options.verbose ? 'inherit' : 'pipe' });
    console.log(`Successfully generated PDF: ${pdfPath}`);
    return true;
  } catch (error) {
    console.error(`Error generating PDF from ${markdownPath}:`, error.message);
    return false;
  }
}

/**
 * Merge all generated PDFs into a single document
 */
async function mergePDFs(pdfFiles) {
  if (options.verbose) console.log('Merging PDFs...');
  
  const merger = new PDFMerger();
  
  for (const file of pdfFiles) {
    if (options.verbose) console.log(`Adding ${file} to merged PDF`);
    await merger.add(file);
  }
  
  const mergedPath = path.join(config.outputDir, config.merged.filename);
  await merger.save(mergedPath);
  
  console.log(`Successfully generated merged PDF: ${mergedPath}`);
  return mergedPath;
}

/**
 * Post-process the PDF files to add metadata, bookmarks, etc.
 */
function postProcessPDF(pdfPath) {
  if (options.verbose) console.log(`Post-processing PDF: ${pdfPath}`);
  
  // Use pdftk for adding metadata
  const metadata = Object.entries(config.merged.metadata)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
  
  const tempOutput = path.join(config.tempDir, 'temp_output.pdf');
  const pdftkCommand = `pdftk "${pdfPath}" update_info_utf8 <(echo ${metadata}) output "${tempOutput}"`;
  
  try {
    execSync(pdftkCommand, { shell: '/bin/bash', stdio: options.verbose ? 'inherit' : 'pipe' });
    fs.renameSync(tempOutput, pdfPath);
    
    if (options.verbose) console.log(`Added metadata to ${pdfPath}`);
    return true;
  } catch (error) {
    console.error(`Error post-processing PDF: ${error.message}`);
    console.log('Skipping post-processing, using original PDF file.');
    return false;
  }
}

/**
 * Main function to generate all enhanced documentation
 */
async function generateEnhancedDocumentation() {
  console.log('Starting FalsoPay Enhanced Documentation Generation...');
  
  // Generate QR codes
  const qrCodeDir = await generateQRCodes();
  
  // Get all markdown files from the source directory
  const markdownFiles = fs.readdirSync(config.sourceDir)
    .filter(file => file.endsWith('.md') && file !== 'README.md')
    .sort();
  
  if (options.verbose) console.log(`Found ${markdownFiles.length} Markdown files to process.`);
  
  // Process each file
  const generatedPDFs = [];
  for (const file of markdownFiles) {
    const mdPath = path.join(config.sourceDir, file);
    const enhancedMdPath = enhanceMarkdown(mdPath);
    
    const pdfFilename = file.replace('.md', '.pdf');
    const pdfPath = path.join(config.outputDir, pdfFilename);
    
    const success = convertToPDF(enhancedMdPath, pdfPath);
    if (success) {
      generatedPDFs.push(pdfPath);
    }
  }
  
  // Merge PDFs if requested
  if (options.merge && generatedPDFs.length > 0) {
    const mergedPDF = await mergePDFs(generatedPDFs);
    
    // Post-process the merged PDF
    postProcessPDF(mergedPDF);
  }
  
  console.log('Documentation generation complete!');
}

// Execute the main function
generateEnhancedDocumentation().catch(error => {
  console.error('Error generating documentation:', error);
  process.exit(1);
}); 