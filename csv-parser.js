const fs = require("fs/promises");
const space = /[\s+-]/g;
const currency = /[£$€]/g;
const carriageReturn = /\r/g;

async function read(fileName) {
  // reads contents of CSV file and returns an array representing each line
  // removes carriage returns
  // removes currency symbols

  try {
    const csv = await fs.readFile(fileName, "utf-8");
    return csv.replace(carriageReturn, "").replace(currency, "").split("\n");
  } catch (err) {
    console.log("Error:", err);
    throw err;
  }
}

async function createTable(fileName, tableName) {
  // Will read CSV file and create table based on its headings
  // Currently it bases data type on the first row under each column
  // If no table name is specified, will create it based on csv name
  // Names have underscores rather than spaces and are all lowerCase

  if (!tableName) tableName = fileName.split(".")[0];
  tableName = tableName.replace(space, "_").toLowerCase();

  try {
    const csv = await read(fileName);

    const columns = csv[0].split(",").map((column) => {
      const obj = {
        column: column.replace(space, "_").toLowerCase(),
        datatype: null,
      };
      return obj;
    });

    csv[1].split(",").forEach((entry, i) => {
      const datatype = Number.isFinite(+entry)
        ? "number"
        : entry === "TRUE" || entry === "FALSE"
        ? "boolean"
        : "varchar(225)";
      columns[i].datatype = datatype;
    });

    let SQL = `CREATE TABLE ${tableName} (\n`;

    columns.forEach((column, i) => {
      SQL += `${column.column} ${column.datatype}`;
      SQL += i === columns.length - 1 ? `\n)` : `,\n`;
    });

    console.log(SQL);
    return SQL;
  } catch (err) {
    console.log("Error:", err);
    throw err;
  }
}

async function insertCSV(fileName, tableName) {
  // reads a CSV file and converts it into an "INSERT INTO" SQL command
  // takes 2 arguments: the name of the table to insert into, and the name or path of the csv file
  // removes spaces from column names
  // add another feature: if no table, create table

  try {
    const csv = await read(fileName);

    const columns = csv[0]
      .split(",")
      .map((column) => column.replace(space, "_").toLowerCase())
      .join(", ");

    const rows = csv.slice(1).map((row) => {
      return row
        .split(",")
        .map((item) => `'${item}'`)
        .join(", ");
    });

    let SQL = `INSERT INTO ${tableName} (${columns})\nVALUES \n`;

    rows.forEach((row, i) => {
      SQL += `(${row})${i === rows.length - 1 ? `;` : `,\n`}`;
    });

    console.log(SQL);
    return SQL;
  } catch (err) {
    console.log("Error:", err);
  }
}

createTable("wedsheet.csv");
// insertCSV("wedsheet.csv", "wedsheet")
