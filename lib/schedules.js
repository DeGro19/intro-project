const database = require( "./database" )

/**
 * @typedef { Object } schedule
 * @property { number } id
 * @property { number } person_id - The ID of the person
 * @property { number } room_id - The ID of the room
 * @property { number } day_of_week - Day of week (0=Sunday, 6=Monday)
 * @property { number } week_offset - Week offset from current week (0=this week)
 * @property { string } [ notes ] - Additional notes (optional)
 */

/**
 * Get schedules - either all or for a specific person
 * @param { URL } parsedurl 
 * @returns { Promise< Array< schedule > > }
 */
async function get( parsedurl ) {
  try {
    const personId = parsedurl.searchParams.get( "person_id" )
    const weekOffset = parseInt( parsedurl.searchParams.get( "week_offset" ) || "0" )
    
    if( personId ) {
      const schedules = await database.getschedulesbyperson( parseInt( personId ), weekOffset )
      return schedules
    } else {
      const schedules = await database.getallschedules( weekOffset )
      return schedules
    }
  } catch( error ) {
    console.error( "Error fetching schedules:", error )
    return []
  }
}

/**
 * Add or update a schedule in the database
 * @param { URL } parsedurl
 * @param { string } method
 * @param { schedule } schedule
 * @return { Promise < object > }
 */
async function add( parsedurl, method, schedule ) {
  try {
    if( undefined !== schedule.id && null !== schedule.id ) {
      // Update existing schedule
      const updatedschedule = await database.updateschedule(
        schedule.id,
        schedule.person_id,
        schedule.room_id,
        schedule.day_of_week,
        schedule.week_offset || 0,
        schedule.notes || ""
      )
      return updatedschedule
    } else {
      // Insert new schedule
      const newschedule = await database.insertschedule(
        schedule.person_id,
        schedule.room_id,
        schedule.day_of_week,
        schedule.week_offset || 0,
        schedule.notes || ""
      )
      return newschedule
    }
  } catch( error ) {
    console.error( "Error adding/updating schedule:", error )
    throw error
  }
}

/**
 * Delete a schedule from the database
 * @param { URL } parsedurl
 * @param { string } method
 * @param { object } data
 * @return { Promise < object > }
 */
async function remove( parsedurl, method, data ) {
  try {
    const deleted = await database.deleteschedule( data.id )
    return { success: deleted }
  } catch( error ) {
    console.error( "Error deleting schedule:", error )
    throw error
  }
}

module.exports = {
  get,
  add,
  remove
}