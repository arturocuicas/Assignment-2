/*
 * Arturo Cuicas
 * 19/08/2018
 * File for CRUD Data
 */

// Dependencies
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

// Container for module (to be exported)
const lib = {};

// Base directory of data folder
lib.baseDir = path.join(__dirname,'/../.data/');

// Write data to the file
lib.create = (dir, file, data) => {
  return new Promise((resolve) => {
    // Open the file for writing
    fs.open(`${lib.baseDir+dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
      if(!err && fileDescriptor) {
        // Convert data to a string
        const stringData = JSON.stringify(data);
        
        // Write to file and close it
        fs.writeFile(fileDescriptor, stringData, (err) => {
          if(err) {
            resolve('Error writing to file');
          }
          // Close the file
          fs.close(fileDescriptor, (err) => {
            if(err) {
              resolve('Error closing new file');
            }
            resolve(true);
          });
        });
      } else {
        resolve('Could not create new file, it may already exist');
      }
    });
  });
};

// Read data from a file
lib.read = (dir,file) => {
  return new Promise((resolve) => {
    // Read the file from the base directory
    fs.readFile(`${lib.baseDir+dir}/${file}.json`, 'utf-8', (err, data) => {
      // If there is no error and the file exists
      if(!err && data) {
        // Parse the data to an object
        const parsedData = helpers.parseJSONToObject(data);
        resolve(parsedData);
      } else {
        resolve(false);
      }
    });
  });
};

// Update data from an existing file
lib.update = (dir, file, data) => {
  return new Promise((resolve) => {
    // Open the file for writing
    fs.open(`${lib.baseDir+dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
      // If there is no error and the file is opened
      if(!err && fileDescriptor) {
        // Convert the data to a string
        const stringData = JSON.stringify(data);

        // Truncate the contents of the file
        fs.truncate(fileDescriptor, (err) => {
          if(err) {
            resolve('Error truncating the file');
          }

          // Write to the file and close it
          fs.writeFile(fileDescriptor, stringData, (err) => {
            if(err) {
              resolve('Error writing to the existing file');
            }
            fs.close(fileDescriptor, (err) => {
              if(err) {
                resolve('Error with closing the existing file');
              }
              resolve(true);
            });
          });
        });
      } else {
        resolve('Could not open the file, it may not exist yet');
      }
    });
  });
};

// Delete a file
lib.delete = (dir, file) => {
  return new Promise((resolve) => {
    // Unlink the file
    fs.unlink(`${lib.baseDir+dir}/${file}.json`, (err) => {
      if(err) {
        resolve('Error deleting the file');
      }
      resolve(true);
    });
  });
};

// List all the items in a directory
lib.list = (dir,callback) => {
  return new Promise((resolve) => {
    fs.readdir(lib.baseDir+dir+'/', (err,data) => {
      if(!err && data && data.length > 0){
        let trimmedFileNames = [];
        data.forEach((fileName) => {
          trimmedFileNames.push(fileName.replace('.json',''));
        });
        resolve(trimmedFileNames);
      } else {
        resolve(false);
      }
    });
  });
};

// Export the module
module.exports = lib;
