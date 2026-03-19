# nStock-server

This README contains setup instructions to follow once you have cloned the repo:

## MySQL Installation and Startup

### Install MySQL

macOS (Homebrew):

    brew install mysql

Windows: (I got this from online but haven't tested it)

- Download and install MySQL from:
  https://dev.mysql.com/downloads/installer/
- Follow the installer instructions to install MySQL Server

---

### Start MySQL

macOS:

    brew services start mysql

Windows: (I got this from online but haven't tested it)

- Start MySQL using MySQL Workbench
  OR
- Start MySQL from Windows Services

## Environment Configuration

Inside the src folder, create a file named .env

The file needs these variables:

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER= (your username)
DB_PASSWORD= (your password)
DB_DATABASE=instock

AUTO_SETUP_DB=true
DB_SETUP_FILE=./database/instock.sql
DB_RESET=true 

## PLEASE CHANGE DB_RESET to false once you start the database, unless you wish to reset it


____________________________________________________________________________

## Database Initialization (Automatic)

Make sure the MySQL server is running
From the "src" folder:

npm install
npm run dev


On startup, the server will initialize the database automatically.
## AGAIN, PLEASE CHANGE DB_RESET to false once you start the database, unless you wish to reset it

Notes:
- If the MySQL root password is blank, press Enter
- If you set a password during installation, enter it when prompted and add it into the .env file from the previous step

This script will:
- Drop the instock database if it exists
- Create the instock database
- Create all required tables
- Seed the database with sample data

---

### Verify Database Setup (Optional but Recommended)

Log into MySQL:

    mysql -u root -p instock

Run:

    SHOW TABLES;
    SELECT COUNT(*) FROM inventories;

You should see the warehouses and inventories tables with data.

Type exit to leave mysql

---

## Starting the API Server 

From the project src directory, run: (if you haven't run `npm install` yet run that first)

    node server.js

You should see:

    Server running on http://localhost:5050

---

## Testing the API

Test the inventories endpoint, open a new terminal and run the following command:

    curl http://localhost:5050/inventories

You should receive a JSON response containing inventory records.

---

## Resetting the Database (Optional)

In the .env file, set your DB_RESET value to true. Then back to false once you reset.

---

## Important Notes

- MySQL must be running before starting the server
- The server does not start MySQL automatically
- Database credentials are loaded from .env

## API documentation

Here's how to do POST, UPDATE, GET and DELETE commands to the api

For `POST` commands:

    curl -X POST http://localhost:5050/inventories \
    -H "Content-Type: application/json" \
    -d '{
        "item_name": "Test USB-C Cable",
        "description": "1m braided USB-C charging cable",
        "category": "Electronics",
        "quantity": 15,
        "warehouse_id": 1
    }'

For `GET` commands:

    curl http://localhost:5050/inventories/71

For `PUT` commands:

    curl -X PUT http://localhost:5050/inventories/71 \
    -H "Content-Type: application/json" \
    -d '{
        "item_name": "Test USB-C Cable (Updated)",
        "description": "2m braided USB-C charging cable",
        "category": "Electronics",
        "quantity": 3,
        "warehouse_id": 1
    }'

For `DELETE` commands:

    curl -X DELETE http://localhost:5050/inventories/71

