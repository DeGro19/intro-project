const database = require("./database")

/**
 * @typedef { Object } room
 * @property { number } id
 * @property { string } name - The name/number of the room.
 * @property { number } building_id - The ID of the building this room belongs to.
 * @property { string } type - The type of room (e.g., bedroom, bathroom).
 * @property { number } capacity - The maximum number of people allowed.
 * @property { string } [notes] - Additional notes about the room (optional).
 */

/**
 * Get all rooms from the database
 * @param { URL } parsedurl 
 * @returns { Promise<Array<object>> }
 */
async function get(parsedurl) {
  try {
    const rooms = await database.getallrooms()
    return rooms
  } catch (error) {
    console.error("Error fetching rooms:", error)
    return []
  }
}

/**
 * Add or update a room in the database
 * @param { URL } parsedurl
 * @param { string } method
 * @param { room } room
 * @returns { Promise<object> }
 */
async function add(parsedurl, method, room) {
  try {
    // Validate required fields
    if (!room.name || !room.building_id) {
      throw new Error("Invalid room data: missing name or building_id")
    }

    // Parse and validate capacity - ensure it's a valid number >= 1
    let safeCapacity = 1 // Default fallback
    if (room.capacity !== undefined && room.capacity !== null && room.capacity !== "") {
      const parsedCapacity = Number(room.capacity)
      if (Number.isFinite(parsedCapacity) && parsedCapacity > 0) {
        safeCapacity = Math.floor(parsedCapacity) // Use floor to ensure integer
      }
    }

    // Parse building_id
    const safeBuildingId = Number.isFinite(Number(room.building_id))
      ? Number(room.building_id)
      : null

    if (!safeBuildingId) {
      throw new Error("Invalid building_id")
    }

    console.log(`Processing room with capacity: ${safeCapacity}`) // Debug log

    if (room.id !== undefined && room.id !== null) {
      // Update existing room
      const updatedroom = await database.updateroom(
        room.id,
        room.name,
        safeBuildingId,
        room.type || "",
        safeCapacity,
        room.notes || ""
      )
      return updatedroom
    } else {
      // Insert new room
      const newroom = await database.insertroom(
        room.name,
        safeBuildingId,
        room.type || "",
        safeCapacity,
        room.notes || ""
      )
      return newroom
    }
  } catch (error) {
    console.error("Error adding/updating room:", error)
    throw error
  }
}

/**
 * Delete a room via the API
 * @param { URL } parsedurl
 * @param { string } method
 * @param { object } data
 * @returns { Promise<object> }
 */
async function remove(parsedurl, method, data) {
  try {
    const deleted = await database.deleteroom(data.id)
    return { success: deleted }
  } catch (error) {
    console.error("Error deleting room:", error)
    throw error
  }
}

module.exports = {
  get,
  add,
  remove
}