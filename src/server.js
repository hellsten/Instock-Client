import express from 'express';
import "dotenv/config"
import cors from "cors";
import db from "./db.js"
import setupDatabaseIfNeeded from './setupDB.js';
import validator from "validator";
import normalizePhone from './validation/helper.js';


await setupDatabaseIfNeeded();



const app = express()
app.use(express.json())

//if cors needed
app.use(cors({ origin: "http://localhost:5173" }));


app.get('/', (req, res) => {
  res.send("API running")
})


// Status is based on quantity (qty)
// Matches your seed data strings: "In Stock" / "Out of Stock"
// Adds "Low Stock" when quantity is small (optional but useful)
function deriveStatus(quantity) {
  if (quantity <= 0) return "Out of Stock";
  return "In Stock";
}


app.get("/warehouses", async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM warehouses ORDER BY id;`);
    res.json(rows);
  } catch (error) {
    console.log("DB ERROR:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
    });
    res.status(500).json({ error: error.message });
  }
});

app.get("/warehouses/:warehouseid", async (req, res) => {
  try {
    const { warehouseid } = req.params;
    const [rows] = await db.query(
      "SELECT * FROM warehouses WHERE id = ? LIMIT 1",
      [warehouseid]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Warehouse not found" });
    }

    res.json(rows[0]);


  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Failed to fetch warehouse` });
  }
});

app.get("/warehouses/:warehouseid/inventory", async (req, res) => {
  try {
    const { warehouseid } = req.params;
    const [rows] = await db.query(`
      SELECT * FROM inventories i 
      WHERE i.warehouse_id = ? 
      ORDER BY i.id;`,
      [warehouseid]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Warehouse not found" });
    }

    res.json(rows);


  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Failed to fetch warehouse inventory` });
  }
});


app.post("/warehouses", async (req, res) => {
  try {

    const allowed = [
      "contact_email",
      "contact_phone",
      "contact_position",
      "contact_name",
      "country",
      "city",
      "address",
      "warehouse_name"
    ]

    const newEntries = {}
    const allowedSet = new Set(allowed)
    // first check that the keys passed in req.body are not missing any of the required keys from allowed

    const extras = []
    const missing = []
    for (const key of Object.keys(req.body)) {
      if (!allowedSet.has(key)) extras.push(key);


    }
    if (extras.length) return res.status(400).json({ error: "sending unrecognized fields", extra_fields: extras })




    for (const key of allowed) {
      if (!(key in req.body)) missing.push(key)
      if (missing.length) {
        return res.status(400).json({ error: "Missing required fields", mising_fields: missing });
      }
      if (req.body[key] !== undefined) newEntries[key] = req.body[key];

    }

    if (Object.keys(newEntries).length === 0 || Object.keys(newEntries).length < 8) {
      return res.status(400).json({ error: "No fields provided to update" });

    }

    const errors = [];

    // validation to screen for null and empty strings

    for (const [key, value] of Object.entries(newEntries)) {

      if (value === null) {
        return res.status(400).json({ error: `${key} cannot have a value of null` })
      }
      if (typeof value == "string") {

        const trimmed = value.trim();
        if (trimmed === "") {
          return res.status(400).json({ error: `${key} value cannot be empty` });
        }
        newEntries[key] = trimmed;

      }
      // phone and email validation 


      if (newEntries.contact_email !== undefined) {
        const email = newEntries.contact_email.toLowerCase()

        if (!validator.isEmail(email, { allow_utf8_local_part: false })) {
          errors.push({ field: "contact_email", msg: "must be a valid email" })
        }
        else {
          newEntries.contact_email = email;
        }

      }
      if (newEntries.contact_phone !== undefined) {
        const result = normalizePhone(newEntries.contact_phone);

        if (!result) {
          errors.push({ field: "contact_phone", msg: "Must be a valid phone number" });
        }
        else {
          newEntries.contact_phone = result;
        }
      }

      if (errors.length) {
        return res.status(400).json({ errors });
      }
    } // end of validation for loop

    const columns = Object.keys(newEntries).join(", ");
    const placeholders = Object.keys(newEntries).map(() => "?").join(", ");
    const values = Object.values(newEntries);

    const [result] = await db.query(
      `INSERT INTO warehouses (${columns}) VALUES (${placeholders})`,
      values
    );

    const [rows] = await db.query(
      "SELECT * FROM warehouses WHERE id = ? LIMIT 1", [result.insertId]

    );


    return res.status(201).json(rows[0]);



  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add a warehouse" });
  }
})

//patch route

app.patch("/warehouses/edit/:warehouseid", async (req, res) => {
  try {
    const { warehouseid } = req.params;
    const allowed = [
      "contact_email",
      "contact_phone",
      "contact_position",
      "contact_name",
      "country",
      "city",
      "address",
      "warehouse_name"
    ]

    const updates = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];

    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields provided to update" });

    }

    const errors = [];

    // start of validation, check for null, empty strings first
    for (const [key, value] of Object.entries(updates)) {

      if (value === null) {
        return res.status(400).json({ error: `${key} cannot have a value of null` })
      }
      if (typeof value == "string") {

        const trimmed = value.trim();
        if (trimmed === "") {
          return res.status(400).json({ error: `${key} cannot be empty` });
        }
        updates[key] = trimmed;

      }
      // phone and email validation - email must contain an @ and a ".", with a letter before and after each of them



      if (updates.contact_email !== undefined) {
        const email = updates.contact_email.toLowerCase()




        if (!validator.isEmail(email, { allow_utf8_local_part: false })) {
          errors.push({ field: "contact_email", msg: "must be a valid email" })
        }
        else {
          updates.contact_email = email;
        }

      }
      if (updates.contact_phone !== undefined) {
        const result = normalizePhone(updates.contact_phone);

        if (!result) {
          errors.push({ field: "contact_phone", msg: "Must be a valid phone number" });
        }
        else {
          updates.contact_phone = result;
        }
      }

      if (errors.length) {
        return res.status(400).json({ errors });
      }
    }

    // end of validation for loop

    const set = Object.keys(updates).map((key) => `${key} = ?`).join(", ");
    const values = [...Object.values(updates), warehouseid];

    const [result] = await db.query(
      `UPDATE warehouses SET ${set} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      console.log("Not Found")
      return res.status(404).json({ error: 'Warehouse not found' });
    }


    const [rows] = await db.query(
      "SELECT * FROM warehouses WHERE id = ? LIMIT 1",
      [warehouseid]
    );

    res.json(rows[0]);


  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update warehouse" });
  }
})

// delete route for warehouses

app.delete("/warehouses/:warehouseid", async (req, res) => {
  const { warehouseid } = req.params;

  try {
    const [result] = await db.query(
      `DELETE FROM warehouses WHERE id = ?`,
      [warehouseid]
    );

    if (result.affectedRows === 0) {
      console.log("Not Found")
      return res.status(404).json({ error: 'Warehouse not found' });
    }

    return res.status(204).send();


  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update warehouse" });
  }

})

// inventories 



app.get("/inventories", async (req, res) => {
  try {
    // Join warehouses so the API can return a location name
    const [rows] = await db.query(`
      SELECT
        i.id,
        i.warehouse_id,
        w.warehouse_name AS warehouse,
        i.item_name,
        i.description,
        i.category,
        i.status,
        i.quantity,
        i.created_at,
        i.updated_at
      FROM inventories i
      LEFT JOIN warehouses w ON w.id = i.warehouse_id
      ORDER BY i.id;
    `);
    res.json(rows);

  }
  catch (error) {
    console.log(error)
    res.status(500).json({ error: "Database error" });

  }
});

// GET one inventory item by id
app.get("/inventories/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT
        i.id,
        i.warehouse_id,
        w.warehouse_name AS warehouse,
        i.item_name,
        i.description,
        i.category,
        i.status,
        i.quantity,
        i.created_at,
        i.updated_at
      FROM inventories i
      LEFT JOIN warehouses w ON w.id = i.warehouse_id
      WHERE i.id = ?;
      `,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Database error" });
  }
});

// CREATE inventory item
// Body should include:
// - item_name (name), category, quantity (qty), description, warehouse_id (location)
app.post("/inventories", async (req, res) => {
  const { item_name, category, quantity, description, warehouse_id } = req.body;

  if (!item_name || !category || quantity === undefined || !description || warehouse_id === undefined) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["item_name", "category", "quantity", "description", "warehouse_id"]
    });
  }

  const status = deriveStatus(Number(quantity));

  try {
    // Ensure warehouse exists (since warehouse_id is a foreign key)
    const [wh] = await db.query("SELECT id FROM warehouses WHERE id = ?;", [warehouse_id]);
    if (wh.length === 0) {
      return res.status(400).json({ error: "Invalid warehouse_id" });
    }

    const [result] = await db.query(
      `
      INSERT INTO inventories (warehouse_id, item_name, description, category, status, quantity)
      VALUES (?, ?, ?, ?, ?, ?);
      `,
      [warehouse_id, item_name, description, category, status, Number(quantity)]
    );

    // Return the newly created row (with warehouse name)
    const [rows] = await db.query(
      `
      SELECT
        i.id,
        i.warehouse_id,
        w.warehouse_name AS warehouse,
        i.item_name,
        i.description,
        i.category,
        i.status,
        i.quantity,
        i.created_at,
        i.updated_at
      FROM inventories i
      LEFT JOIN warehouses w ON w.id = i.warehouse_id
      WHERE i.id = ?;
      `,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Database error" });
  }
});

// UPDATE inventory item (full update)
app.put("/inventories/:id", async (req, res) => {
  const { item_name, category, quantity, description, warehouse_id } = req.body;

  if (!item_name || !category || quantity === undefined || !description || warehouse_id === undefined) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["item_name", "category", "quantity", "description", "warehouse_id"]
    });
  }

  const status = deriveStatus(Number(quantity));

  try {
    // Ensure warehouse exists
    const [wh] = await db.query("SELECT id FROM warehouses WHERE id = ?;", [warehouse_id]);
    if (wh.length === 0) {
      return res.status(400).json({ error: "Invalid warehouse_id" });
    }

    const [result] = await db.query(
      `
      UPDATE inventories
      SET warehouse_id = ?, item_name = ?, description = ?, category = ?, status = ?, quantity = ?
      WHERE id = ?;
      `,
      [warehouse_id, item_name, description, category, status, Number(quantity), req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    const [rows] = await db.query(
      `
      SELECT
        i.id,
        i.warehouse_id,
        w.warehouse_name AS warehouse,
        i.item_name,
        i.description,
        i.category,
        i.status,
        i.quantity,
        i.created_at,
        i.updated_at
      FROM inventories i
      LEFT JOIN warehouses w ON w.id = i.warehouse_id
      WHERE i.id = ?;
      `,
      [req.params.id]
    );

    res.json(rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Database error" });
  }
});

// DELETE inventory item
app.delete("/inventories/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM inventories WHERE id = ?;", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    // No content
    res.status(204).send();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Database error" });
  }
});


const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});