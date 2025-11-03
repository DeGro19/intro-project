const database = require( "./database" )

/**
 * @typedef { Object } landlord
 * @property { number } id
 * @property { string } name - The name of the landlord.
 * @property { string } email - The email address of the landlord.
 * @property { string } phone - The phone number of the landlord.
 * @property { string } [ notes ] - Additional notes about the landlord (optional).
 */

/**
 * Get all landlords from the database
 * @param { URL } parsedurl 
 * @returns { Promise< Array< landlord > > }
 */
async function get( parsedurl ) {
  try {
    const landlords = await database.getalllandlords()
    return landlords
  } catch( error ) {
    console.error( "Error fetching landlords:", error )
    return []
  }
}

/**
 * Add or update a landlord in the database
 * @param { URL } parsedurl
 * @param { string } method
 * @param { landlord } landlord
 * @return { Promise < object > }
 */
async function add( parsedurl, method, landlord ) {
  try {
    if( undefined !== landlord.id && null !== landlord.id ) {
      const updatedlandlord = await database.updatelandlord(
        landlord.id,
        landlord.name,
        landlord.email || "",
        landlord.phone || "",
        landlord.notes || ""
      )
      return updatedlandlord
    } else {
      const newlandlord = await database.insertlandlord(
        landlord.name,
        landlord.email || "",
        landlord.phone || "",
        landlord.notes || ""
      )
      return newlandlord
    }
  } catch( error ) {
    console.error( "Error adding/updating landlord:", error )
    throw error
  }
}

/**
 * Delete a landlord from the database
 * @param { URL } parsedurl
 * @param { string } method
 * @param { object } data
 * @return { Promise < object > }
 */
async function remove( parsedurl, method, data ) {
  try {
    const deleted = await database.deletelandlord( data.id )
    return { success: deleted }
  } catch( error ) {
    console.error( "Error deleting landlord:", error )
    throw error
  }
}

module.exports = {
  get,
  add,
  remove
}