const fs = require('fs');
const path = require('path');

async function removeI18nKeyFromMetaFiles() {
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
                
                // Check if i18nKey exists in the file
                if (content.includes('i18nKey:')) {
                    // Remove i18nKey line and handle trailing commas
                    // Pattern: i18nKey: '...', with optional trailing comma
                    const regex = /,\s*\n\s*i18nKey:\s*'[^']*',?\n/g;
                    content = content.replace(regex, '\n');
                    
                    // Also handle i18nKey without trailing comma (last property)
                    const regex2 = /,\s*\n\s*i18nKey:\s*'[^']*'\n/g;
                    content = content.replace(regex2, '\n');
                    
                    // Write back the modified content
                    fs.writeFileSync(metaFile, content, 'utf8');
                    console.log(`✓ Removed i18nKey from ${metaFile}`);
                    processedCount++;
                } else {
                    console.log(`- No i18nKey found in ${metaFile}`);
                }
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
removeI18nKeyFromMetaFiles().catch(console.error);