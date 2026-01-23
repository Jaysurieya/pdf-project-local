// const fs = require('fs');
// const path = require('path');

// /**
//  * Safely deletes all files in a directory
//  * @param {string} directoryPath - Path to the directory to clean
//  */
// function cleanDirectory(directoryPath) {
//   return new Promise((resolve, reject) => {
//     if (!fs.existsSync(directoryPath)) {
//       return resolve();
//     }

//     fs.readdir(directoryPath, (err, files) => {
//       if (err) {
//         console.error(`Error reading directory ${directoryPath}:`, err);
//         return reject(err);
//       }

//       let pending = files.length;
//       if (pending === 0) {
//         return resolve();
//       }

//       files.forEach(file => {
//         const filePath = path.join(directoryPath, file);
        
//         fs.unlink(filePath, err => {
//           if (err) {
//             console.error(`Error deleting file ${filePath}:`, err);
//           } else {
//             console.log(`🗑️ Deleted: ${filePath}`);
//           }
          
//           pending--;
//           if (pending === 0) {
//             resolve();
//           }
//         });
//       });
//     });
//   });
// }

// module.exports = { cleanDirectory };

const fs = require('fs');
const path = require('path');

/**
 * Clean directory - delete all files but keep the directory
 * @param {string} dirPath - Directory to clean
 */
function cleanDirectory(dirPath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(dirPath)) {
      console.log(`📁 Directory doesn't exist, skipping cleanup: ${dirPath}`);
      return resolve();
    }

    fs.readdir(dirPath, (err, files) => {
      if (err) {
        console.error(`❌ Error reading directory ${dirPath}:`, err);
        return reject(err);
      }

      if (files.length === 0) {
        console.log(`✅ Directory already clean: ${dirPath}`);
        return resolve();
      }

      let deleted = 0;
      let errors = 0;

      files.forEach((file, index) => {
        const filePath = path.join(dirPath, file);
        
        try {
          const stats = fs.statSync(filePath);
          
          if (stats.isFile()) {
            fs.unlinkSync(filePath);
            deleted++;
            console.log(`🗑️ Deleted: ${filePath}`);
          }
        } catch (err) {
          errors++;
          console.error(`❌ Failed to delete ${filePath}:`, err.message);
        }

        // Resolve when all files processed
        if (index === files.length - 1) {
          console.log(`✅ Cleanup complete: ${deleted} deleted, ${errors} errors`);
          resolve();
        }
      });
    });
  });
}

/**
 * Delete a single file safely
 */
function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Deleted: ${filePath}`);
      return true;
    }
  } catch (err) {
    console.error(`❌ Failed to delete ${filePath}:`, err.message);
  }
  return false;
}

module.exports = { cleanDirectory, deleteFile };
