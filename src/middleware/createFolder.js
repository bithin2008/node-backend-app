const fs = require('fs').promises;


/* const createFolder = (folderPath) => {
    return new Promise((resolve, reject) => {
        fs.mkdir(folderPath, { recursive: true }, (error) => {
            if (error) {
                console.error(`Error creating folder: ${error}`);
                reject(error);
            } else {
                console.log(`Folder created successfully at path: ${folderPath}`);
                resolve(true);
            }
        });
    });
}; */

const createFolder = async (folderPath) => {
    try {
        await fs.mkdir(folderPath, { recursive: true });       
        return true;
    } catch (error) {
        console.error(`Error creating folder: ${error}`);
        throw error;
    }
};


module.exports = createFolder;
