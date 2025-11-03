const database = require( "./database" )

/**
 * @typedef { Object } building
 * @property { number } id
 * @property { string } name - The name of the building.
 * @property { string } address - The address of the building.
 * @property { number } landlord_id - The ID of the landlord who owns the building.
 * @property { string } [ notes ] - Additional notes about the building (optional).
 */

/**
 * Get all buildings from the database
 * @param { URL } parsedurl 
 * @returns { Promise< Array< building > > }
 */
async function get( parsedurl ) {
  try {
    const buildings = await database.getallbuildings()
    return buildings
  } catch( error ) {
    console.error( "Error fetching buildings:", error )
    return []
  }
}

/**
 * Add or update a building in the database
 * @param { URL } parsedurl
 * @param { string } method
 * @param { building } building
 * @return { Promise < object > }
 */
async function add( parsedurl, method, building ) {
  try {
    if( undefined !== building.id && null !== building.id ) {
      // Update existing building
      const updatedbuilding = await database.updatebuilding(
        building.id,
        building.name,
        building.address || "",
        building.landlord_id || null,
        building.notes || ""
      )
      return updatedbuilding
    } else {
      // Insert new building
      const newbuilding = await database.insertbuilding(
        building.name,
        building.address || "",
        building.landlord_id || null,
        building.notes || ""
      )
      return newbuilding
    }
  } catch( error ) {
    console.error( "Error adding/updating building:", error )
    throw error
  }
}

/**
 * Delete a building from the database
 * @param { URL } parsedurl
 * @param { string } method
 * @param { object } data
 * @return { Promise < object > }
 */
async function remove( parsedurl, method, data ) {
  try {
    const deleted = await database.deletebuilding( data.id )
    return { success: deleted }
  } catch( error ) {
    console.error( "Error deleting building:", error )
    throw error
  }
}

module.exports = {
  get,
  add,
  remove
}