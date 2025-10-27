const fs = require('fs');
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const dotenv = require('dotenv');

const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => console.log('DB Connection Succesful'));

// READ FILE

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'),
);

// IMPORT DATA INTO DB

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data succesfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data succesfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
