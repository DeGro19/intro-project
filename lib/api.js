const people = require( "./people" )
const landlords = require( "./landlords" )
const buildings = require( "./buildings" )
const rooms = require( "./rooms" )
const schedules = require( "./schedules" )

/**
 * Check for a valid API url call and handle.
 * @param { URL } parsedurl 
 * @param { object } res
 * @param { object } req
 * @param { object } receivedobj
 */
async function handleapi( parsedurl, res, req, receivedobj ) {

  const pathname = parsedurl.pathname

  // Define all API endpoints and their allowed HTTP methods
  const calls = {
    "/api/people": { "GET": people.get, "PUT": people.add, "DELETE": people.remove },
    "/api/landlords": { "GET": landlords.get, "PUT": landlords.add, "DELETE": landlords.remove },
    "/api/buildings": { "GET": buildings.get, "PUT": buildings.add, "DELETE": buildings.remove },
    "/api/rooms": { "GET": rooms.get, "PUT": rooms.add, "DELETE": rooms.remove },
    "/api/schedules": { "GET": schedules.get, "PUT": schedules.add, "DELETE": schedules.remove }
  }

  // Check if the pathname and method are valid
  if( !( pathname in calls ) || !( req.method in calls[ pathname ] ) ) {
    console.error( "404 file not found: ", pathname )
    res.writeHead( 404, { "Content-Type": "text/plain" })
    res.end( "404 - Not found" )
    return
  }

  // Call the appropriate function and return the data
  const data = await calls[ pathname ][ req.method ]( parsedurl, req.method, receivedobj )

  res.writeHead( 200, { "Content-Type": "application/json" } )
  res.end( JSON.stringify( data ) )
}


module.exports = {
  handleapi
}