const fs = require('fs');
const path = require('path');

function buildProject() {
  const distDir = path.join(__dirname, '..', 'dist');
  
  // Ensure dist directory exists
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
  }

  // Copy essential files
  const essentialDirs = [
    '01_Welcome_Message',
    '04_Quick_Start_Guides',
    '09_Workflow_Automation',
    '32_Free_Tools'
  ];

  essentialDirs.forEach(dir => {
    const srcPath = path.join(__dirname, '..', dir);
    const destPath = path.join(distDir, dir);
    
    if (fs.existsSync(srcPath)) {
      fs.cpSync(srcPath, destPath, { recursive: true });
    }
  });

  // Generate basic index.html
  const indexContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>iHelper Resource Library</title>
</head>
<body>
    <h1>iHelper Resource Library</h1>
    <nav>
        <ul>
            <li><a href="/01_Welcome_Message">Welcome</a></li>
            <li><a href="/04_Quick_Start_Guides">Quick Start</a></li>
            <li><a href="/09_Workflow_Automation">Workflow Automation</a></li>
            <li><a href="/32_Free_Tools">Free Tools</a></li>
        </ul>
    </nav>
</body>
</html>
  `;

  fs.writeFileSync(path.join(distDir, 'index.html'), indexContent);

  console.log('Build completed successfully');
}

if (require.main === module) {
  buildProject();
}

module.exports = buildProject;
