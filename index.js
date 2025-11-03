// Import required modules
const http = require( "http" )
const fs = require( "fs" )
const path = require( "path" )

const api = require( "./lib/api" )

const publicdirectory = path.join( __dirname, "public" )

/**
 * Function to serve static files (HTML, CSS, JS)
 * @param { object } res 
 * @param { string } filepath 
 * @param { string } contenttype 
 */
function servestaticfile( res, filepath, contenttype ) {
  fs.readFile( filepath, ( err, content ) => {
    if( err ) {
      console.error( "404 file not found: ", filepath )
      res.writeHead(404, { "Content-Type": "text/plain" })
      res.end( "404 - Not found" )
    } else {
      res.writeHead( 200, { "Content-Type": contenttype } )
      res.end( content, "utf-8" )
    }
  } )
}

/**
 * Create and start our server
 */
const server = http.createServer( async ( req, res ) => {

  const headers = req.headers;
  // @ts-ignore (tls socket encrypted does exist)
  const protocol = headers[ "x-forwarded-proto" ] || (req.socket.encrypted ? "https" : "http" )
  const host = headers[ "x-forwarded-host"] || headers.host
  const baseurl = `${protocol}://${host}`

  const parsedurl = new URL( req.url, baseurl )
  const pathname = parsedurl.pathname

  let data = ""
  req.on( "data", ( chunk ) => {
    data += chunk
  } )

  let receivedobj
  req.on( "end", async () => {

    try{ 
      receivedobj = JSON.parse( data )
    } catch( e ) { /* silent */ }

    if( 0 == pathname.indexOf( "/api/" ) ) {
      await api.handleapi( parsedurl, res, req, receivedobj )
    } else {
      // If the request is for a static file (HTML, CSS, JS)
      let filePath = path.join(
        publicdirectory,
        pathname === "/" ? "/index.html" : pathname
      )
      let extname = path.extname( filePath )
      let contentType = "text/html"

      const types = {
        ".js": "text/javascript",
        ".css": "text/css"
      }
      if( extname in types ) contentType = types[ extname ]

      servestaticfile( res, filePath, contentType )
    }
  } )
})


const port = process.env.PORT || 3000
server.listen( port, () => {
  console.log(`Server is running on port ${port}`)
} )
