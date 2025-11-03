const sqlite3 = require("sqlite3").verbose()
const path = require("path")

const dbpath = path.join(__dirname, "..", "database.sqlite")

const db = new sqlite3.Database(dbpath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message)
  } else {
    console.log("Connected to SQLite database")
    initializedb()
  }
})

/**
 * Initialize database tables if they don't exist
 */
function initializedb() {
  db.run(`
    CREATE TABLE IF NOT EXISTS people (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      notes TEXT
    )
  `, (err) => {
    if (err) {
      console.error("Error creating people table:", err.message)
    } else {
      console.log("People table ready")
    }
  })

  db.run(`
    CREATE TABLE IF NOT EXISTS landlords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      notes TEXT
    )
  `, (err) => {
    if (err) {
      console.error("Error creating landlords table:", err.message)
    } else {
      console.log("Landlords table ready")
    }
  })

  db.run(`
    CREATE TABLE IF NOT EXISTS buildings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT,
      landlord_id INTEGER,
      notes TEXT,
      FOREIGN KEY (landlord_id) REFERENCES landlords(id) ON DELETE SET NULL
    )
  `, (err) => {
    if (err) {
      console.error("Error creating buildings table:", err.message)
    } else {
      console.log("Buildings table ready")
    }
  })

  db.run(`
  CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    building_id INTEGER NOT NULL,
    type TEXT,
    capacity INTEGER DEFAULT 1,
    notes TEXT,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE
  )
`, (err) => {
    if (err) {
      console.error("Error creating rooms table:", err.message)
    } else {
      console.log("Rooms table ready")
    }
  })

  // NEW: Schedules table
  db.run(`
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      person_id INTEGER NOT NULL,
      room_id INTEGER NOT NULL,
      day_of_week INTEGER NOT NULL,
      week_offset INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
      UNIQUE(person_id, room_id, day_of_week, week_offset)
    )
  `, (err) => {
    if (err) {
      console.error("Error creating schedules table:", err.message)
    } else {
      console.log("Schedules table ready")
    }
  })
}

// ====== PEOPLE FUNCTIONS ======

function getallpeople() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM people ORDER BY name", [], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

function getpersonbyid(id) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM people WHERE id = ?", [id], (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row || null)
      }
    })
  })
}

function insertperson(name, email, notes) {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO people (name, email, notes) VALUES (?, ?, ?)"

    db.run(sql, [name, email, notes], function (err) {
      if (err) {
        reject(err)
      } else {
        resolve({
          id: this.lastID,
          name: name,
          email: email,
          notes: notes
        })
      }
    })
  })
}

function updateperson(id, name, email, notes) {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE people SET name = ?, email = ?, notes = ? WHERE id = ?"

    db.run(sql, [name, email, notes, id], function (err) {
      if (err) {
        reject(err)
      } else {
        resolve({
          id: id,
          name: name,
          email: email,
          notes: notes
        })
      }
    })
  })
}

function deleteperson(id) {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM people WHERE id = ?", [id], function (err) {
      if (err) {
        reject(err)
      } else {
        resolve(this.changes > 0)
      }
    })
  })
}

// ====== LANDLORD FUNCTIONS ======

function getalllandlords() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM landlords ORDER BY name", [], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

function getlandlordbyid(id) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM landlords WHERE id = ?", [id], (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row || null)
      }
    })
  })
}

function insertlandlord(name, email, phone, notes) {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO landlords (name, email, phone, notes) VALUES (?, ?, ?, ?)"

    db.run(sql, [name, email, phone, notes], function (err) {
      if (err) {
        reject(err)
      } else {
        resolve({
          id: this.lastID,
          name: name,
          email: email,
          phone: phone,
          notes: notes
        })
      }
    })
  })
}

function updatelandlord(id, name, email, phone, notes) {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE landlords SET name = ?, email = ?, phone = ?, notes = ? WHERE id = ?"

    db.run(sql, [name, email, phone, notes, id], function (err) {
      if (err) {
        reject(err)
      } else {
        resolve({
          id: id,
          name: name,
          email: email,
          phone: phone,
          notes: notes
        })
      }
    })
  })
}

function deletelandlord(id) {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM landlords WHERE id = ?", [id], function (err) {
      if (err) {
        reject(err)
      } else {
        resolve(this.changes > 0)
      }
    })
  })
}

// ====== BUILDING FUNCTIONS ======

function getallbuildings() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT b.*, l.name as landlord_name 
      FROM buildings b
      LEFT JOIN landlords l ON b.landlord_id = l.id
      ORDER BY b.name
    `
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

function getbuildingbyid(id) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT b.*, l.name as landlord_name 
      FROM buildings b
      LEFT JOIN landlords l ON b.landlord_id = l.id
      WHERE b.id = ?
    `
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row || null)
      }
    })
  })
}

function insertbuilding(name, address, landlordId, notes) {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO buildings (name, address, landlord_id, notes) VALUES (?, ?, ?, ?)"

    db.run(sql, [name, address, landlordId, notes], function (err) {
      if (err) {
        reject(err)
      } else {
        resolve({
          id: this.lastID,
          name: name,
          address: address,
          landlord_id: landlordId,
          notes: notes
        })
      }
    })
  })
}

function updatebuilding(id, name, address, landlordId, notes) {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE buildings SET name = ?, address = ?, landlord_id = ?, notes = ? WHERE id = ?"

    db.run(sql, [name, address, landlordId, notes, id], function (err) {
      if (err) {
        reject(err)
      } else {
        resolve({
          id: id,
          name: name,
          address: address,
          landlord_id: landlordId,
          notes: notes
        })
      }
    })
  })
}

function deletebuilding(id) {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM buildings WHERE id = ?", [id], function (err) {
      if (err) {
        reject(err)
      } else {
        resolve(this.changes > 0)
      }
    })
  })
}

// ====== ROOM FUNCTIONS ======

function getallrooms() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT r.*, b.name as building_name 
      FROM rooms r
      LEFT JOIN buildings b ON r.building_id = b.id
      ORDER BY b.name, r.name
    `
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

function getroomsbybuilding(buildingId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT r.*, b.name as building_name 
      FROM rooms r
      LEFT JOIN buildings b ON r.building_id = b.id
      WHERE r.building_id = ?
      ORDER BY r.name
    `
    db.all(sql, [buildingId], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

function getroombyid(id) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT r.*, b.name as building_name 
      FROM rooms r
      LEFT JOIN buildings b ON r.building_id = b.id
      WHERE r.id = ?
    `
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row || null)
      }
    })
  })
}

function insertroom(name, buildingId, type, capacity, notes) {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO rooms (name, building_id, type, capacity, notes) VALUES (?, ?, ?, ?, ?)"

    db.run(sql, [name, buildingId, type, capacity, notes], function (err) {
      if (err) {
        reject(err)
      } else {
        resolve({
          id: this.lastID,
          name: name,
          building_id: buildingId,
          type: type,
          capacity: capacity,
          notes: notes
        })
      }
    })
  })
}

function updateroom(id, name, buildingId, type, capacity, notes) {
  return new Promise((resolve, reject) => {
    // FIXED: Added notes to the SQL UPDATE statement
    const sql = "UPDATE rooms SET name = ?, building_id = ?, type = ?, capacity = ?, notes = ? WHERE id = ?"

    db.run(sql, [name, buildingId, type, capacity, notes, id], function (err) {
      if (err) {
        reject(err)
      } else {
        resolve({
          id: id,
          name: name,
          building_id: buildingId,
          type: type,
          capacity: capacity,
          notes: notes
        })
      }
    })
  })
}

function deleteroom(id) {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM rooms WHERE id = ?", [id], function (err) {
      if (err) {
        reject(err)
      } else {
        resolve(this.changes > 0)
      }
    })
  })
}

// ====== SCHEDULE FUNCTIONS ======

function getschedulesbyperson(personId, weekOffset = 0) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT s.*, r.name as room_name, r.building_id, b.name as building_name
      FROM schedules s
      LEFT JOIN rooms r ON s.room_id = r.id
      LEFT JOIN buildings b ON r.building_id = b.id
      WHERE s.person_id = ? AND s.week_offset = ?
      ORDER BY s.day_of_week
    `
    db.all(sql, [personId, weekOffset], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

function getallschedules(weekOffset = 0) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT s.*, p.name as person_name, r.name as room_name, b.name as building_name
      FROM schedules s
      LEFT JOIN people p ON s.person_id = p.id
      LEFT JOIN rooms r ON s.room_id = r.id
      LEFT JOIN buildings b ON r.building_id = b.id
      WHERE s.week_offset = ?
      ORDER BY p.name, s.day_of_week
    `
    db.all(sql, [weekOffset], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

function insertschedule(personId, roomId, dayOfWeek, weekOffset, notes) {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO schedules (person_id, room_id, day_of_week, week_offset, notes) VALUES (?, ?, ?, ?, ?)"

    db.run(sql, [personId, roomId, dayOfWeek, weekOffset, notes], function (err) {
      if (err) {
        reject(err)
      } else {
        resolve({
          id: this.lastID,
          person_id: personId,
          room_id: roomId,
          day_of_week: dayOfWeek,
          week_offset: weekOffset,
          notes: notes
        })
      }
    })
  })
}

function updateschedule(id, personId, roomId, dayOfWeek, weekOffset, notes) {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE schedules SET person_id = ?, room_id = ?, day_of_week = ?, week_offset = ?, notes = ? WHERE id = ?"

    db.run(sql, [personId, roomId, dayOfWeek, weekOffset, notes, id], function (err) {
      if (err) {
        reject(err)
      } else {
        resolve({
          id: id,
          person_id: personId,
          room_id: roomId,
          day_of_week: dayOfWeek,
          week_offset: weekOffset,
          notes: notes
        })
      }
    })
  })
}

function deleteschedule(id) {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM schedules WHERE id = ?", [id], function (err) {
      if (err) {
        reject(err)
      } else {
        resolve(this.changes > 0)
      }
    })
  })
}

function closedb() {
  db.close((err) => {
    if (err) {
      console.error("Error closing database:", err.message)
    } else {
      console.log("Database connection closed")
    }
  })
}

module.exports = {
  getallpeople,
  getpersonbyid,
  insertperson,
  updateperson,
  deleteperson,
  getalllandlords,
  getlandlordbyid,
  insertlandlord,
  updatelandlord,
  deletelandlord,
  getallbuildings,
  getbuildingbyid,
  insertbuilding,
  updatebuilding,
  deletebuilding,
  getallrooms,
  getroomsbybuilding,
  getroombyid,
  insertroom,
  updateroom,
  deleteroom,
  getschedulesbyperson,
  getallschedules,
  insertschedule,
  updateschedule,
  deleteschedule,
  closedb
}