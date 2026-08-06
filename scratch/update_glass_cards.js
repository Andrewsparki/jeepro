const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../features/analytics/components');

const config = {
  'completion-trend.tsx': 'emerald',
  'focus-distribution.tsx': 'blue',
  'level-progress-chart.tsx': 'amber',
  'sessions-bar-chart.tsx': 'purple',
  'streak-calendar.tsx': 'orange',
  'study-heatmap.tsx': 'orange',
  'subject-distribution.tsx': 'purple',
  'trend-chart.tsx': 'blue',
  'xp-growth-chart.tsx': 'amber'
};

for (const [file, tint] of Object.entries(config)) {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already has GlassCard imported (except if it was only partial)
  if (!content.includes('import { GlassCard } from "@/components/ui/glass-card"')) {
    // add import after the last import
    const importRegex = /import .* from ".*";\n/g;
    let match;
    let lastIndex = 0;
    while ((match = importRegex.exec(content)) !== null) {
      lastIndex = match.index + match[0].length;
    }
    content = content.slice(0, lastIndex) + 'import { GlassCard } from "@/components/ui/glass-card";\n' + content.slice(lastIndex);
  }

  // Find `<div className="premium-card` for the main component (not skeleton usually, or both if needed)
  // Actually, we can replace all occurrences.
  // We need to carefully match opening div and its corresponding closing div.
  // A simple regex might fail on nested divs. Let's do it manually via a stack parser.

  let output = '';
  let i = 0;
  let inTargetDiv = false;
  let divDepth = 0;
  let targetDivDepth = -1;

  while (i < content.length) {
    // Check for `<div className="premium-card`
    if (content.startsWith('<div className="premium-card', i)) {
      divDepth++;
      
      const isCard = true;
      let startIdx = i;
      
      // Find the closing >
      let j = i;
      while (j < content.length && content[j] !== '>') j++;
      
      const tagContent = content.slice(i, j + 1);
      
      // Replace it
      // <div className="premium-card xxx"> -> <GlassCard hoverTint="tint" className="xxx">
      // or <div className="premium-card" -> <GlassCard hoverTint="tint"
      let newTag = tagContent
        .replace('<div', `<GlassCard hoverTint="${tint}"`)
        .replace('premium-card ', '')
        .replace('premium-card', '');
      
      // cleanup empty className
      newTag = newTag.replace(' className=""', '');

      output += newTag;
      
      targetDivDepth = divDepth;
      
      i = j + 1;
      continue;
    }

    if (content.startsWith('<div', i) && !content.startsWith('</div>', i)) {
      divDepth++;
      // Handle self-closing div like <div />
      // We don't want to increment depth for self-closing divs, so check for />
      let j = i;
      while (j < content.length && content[j] !== '>') j++;
      if (content[j-1] === '/') {
        divDepth--;
      }
    }

    if (content.startsWith('</div', i)) {
      if (divDepth === targetDivDepth) {
        output += '</GlassCard>';
        targetDivDepth = -1; // Wait for next one (e.g. skeleton)
        i += 6; // length of </div>
        divDepth--;
        continue;
      }
      divDepth--;
    }

    output += content[i];
    i++;
  }

  fs.writeFileSync(filePath, output);
  console.log('Updated ' + file);
}
