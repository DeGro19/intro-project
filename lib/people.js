const database = require( "./database" )

/**
 * @typedef { Object } person
 * @property { number } id
 * @property { string } name - The name of the person.
 * @property { string } email - The email address of the person.
 * @property { string } [ notes ] - Additional notes about the person (optional).
 */

/**
 * Get all people from the database
 * @param { URL } parsedurl 
 * @returns { Promise< Array< person > > }
 */
async function get( parsedurl ) {
  try {
    const people = await database.getallpeople()
    return people
  } catch( error ) {
    console.error( "Error fetching people:", error )
    return []
  }
}

/**
 * Add or update a person in the database
 * @param { URL } parsedurl
 * @param { string } method
 * @param { person } person
 * @return { Promise < object > }
 */
async function add( parsedurl, method, person ) {
  try {
    // Check if this is an update (person has an id) or a new insert
    if( undefined !== person.id && null !== person.id ) {
      // Update existing person
      const updatedperson = await database.updateperson(
        person.id,
        person.name,
        person.email || "",
        person.notes || ""
      )
      return updatedperson
    } else {
      // Insert new person
      const newperson = await database.insertperson(
        person.name,
        person.email || "",
        person.notes || ""
      )
      return newperson
    }
  } catch( error ) {
    console.error( "Error adding/updating person:", error )
    throw error
  }
}

/**
 * Delete a person from the database
 * @param { URL } parsedurl
 * @param { string } method
 * @param { object } data
 * @return { Promise < object > }
 */
async function remove( parsedurl, method, data ) {
  try {
    const deleted = await database.deleteperson( data.id )
    return { success: deleted }
  } catch( error ) {
    console.error( "Error deleting person:", error )
    throw error
  }
}

module.exports = {
  get,
  add,
  remove
}