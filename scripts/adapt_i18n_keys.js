const fs = require('fs');
const path = require('path');

async function adaptMetaFilesToI18nKeys() {
    const toolsDir = path.join('creativity-kits', 'tools');
    
    try {
        // Find all meta.ts files recursively
        const metaFiles = await findMetaFiles(toolsDir);
        console.log(`Found ${metaFiles.length} meta.ts files`);
        
        let processedCount = 0;
        let errorCount = 0;
        
        for (const metaFile of metaFiles) {
            try {
                // Read file content
                let content = fs.readFileSync(metaFile, 'utf8');
                
                // Extract tool ID from file path
                const toolId = path.basename(path.dirname(metaFile));
                
                // Check if name and description need to be converted to i18n keys
                // Pattern: name: '中文文本' -> name: 'tools.{toolId}.name'
                // Pattern: description: '中文文本' -> description: 'tools.{toolId}.desc'
                
                // Replace name field
                const nameRegex = /name:\s*'([^']*)'/g;
                content = content.replace(nameRegex, `name: 'tools.${toolId}.name'`);
                
                // Replace description field  
                const descRegex = /description:\s*'([^']*)'/g;
                content = content.replace(descRegex, `description: 'tools.${toolId}.desc'`);
                
                // Write back the modified content
                fs.writeFileSync(metaFile, content, 'utf8');
                console.log(`✓ Adapted ${toolId} to i18n keys`);
                processedCount++;
                
            } catch (error) {
                console.error(`✗ Error processing ${metaFile}:`, error.message);
                errorCount++;
            }
        }
        
        console.log(`\nProcessing completed:`);
        console.log(`- Successfully processed: ${processedCount} files`);
        console.log(`- Errors: ${errorCount} files`);
        
    } catch (error) {
        console.error('Error finding meta files:', error);
    }
}

async function findMetaFiles(dir) {
    const files = [];
    
    function walkDirectory(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                walkDirectory(fullPath);
            } else if (item === 'meta.ts') {
                files.push(fullPath);
            }
        }
    }
    
    walkDirectory(dir);
    return files;
}

// Run the script
adaptMetaFilesToI18nKeys().catch(console.error);