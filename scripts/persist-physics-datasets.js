const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'features', 'study', 'data', 'physics-chapters');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const fileMap = [
  {
    src: 'c:/Users/Andrew/Downloads/gemini-code-1792125670033.json',
    dest: 'manifest.json'
  },
  {
    src: 'c:/Users/Andrew/Downloads/gemini-code-1792125697133.json',
    dest: 'phys-01-units-and-measurements.json'
  },
  {
    src: 'c:/Users/Andrew/Downloads/gemini-code-1792125739216.json',
    dest: 'phys-02-kinematics.json'
  },
  {
    src: 'c:/Users/Andrew/Downloads/gemini-code-1792125753310.json',
    dest: 'phys-03-laws-of-motion.json'
  },
  {
    src: 'c:/Users/Andrew/Downloads/gemini-code-1792125831437.json',
    dest: 'phys-04-work-energy-and-power.json'
  },
  {
    src: 'c:/Users/Andrew/Downloads/gemini-code-1792125873895.json',
    dest: 'phys-05-rotational-motion.json'
  },
  {
    src: 'c:/Users/Andrew/Downloads/gemini-code-1792126059197.json',
    dest: 'phys-06-gravitation.json',
    fixGravitation: true
  }
];

fileMap.forEach(({ src, dest, fixGravitation }) => {
  let content = fs.readFileSync(src, 'utf8');
  if (fixGravitation) {
    const target = '($' + String.fromCharCode(92) + 'lambda';
    const replacement = '($' + String.fromCharCode(92) + String.fromCharCode(92) + 'lambda';
    content = content.replace(target, replacement);
  }
  
  // Verify valid JSON
  const parsed = JSON.parse(content);
  const targetPath = path.join(targetDir, dest);
  fs.writeFileSync(targetPath, JSON.stringify(parsed, null, 2), 'utf8');
  console.log(`Copied & Verified: ${dest} (${parsed.title || parsed.datasetId})`);
});
