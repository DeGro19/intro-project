const rooturl = `${window.location.protocol}//${window.location.host}/api/`

/**
 * Wrapper for all API GET requests
 * @param { string } api 
 * @returns { Promise< object > }
 */
export async function getdata( api ) {
  try {
    const url = rooturl + api

    const response = await fetch( url )

    if( response.ok ) {
      const data = await response.json()
      return data
    } else {
      throw new Error( `Request failed with status: ${response.status}` )
    }
  } catch (error) {
    console.error( 'Error fetching data:', error.message )
  }
}

/**
 * Wrapper for all API PUT requests (Add/Update)
 * @param { string } api
 * @param { object } data
 * @returns { Promise }
 */
export async function putdata( api, data ) {
  const request = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify( data )
  }

  const url = rooturl + api
  const response = await fetch( url, request )
  
  if( !response.ok ) {
    throw new Error( `PUT request failed with status: ${response.status}` )
  }
  
  return await response.json()
}

/**
 * Wrapper for all API DELETE requests
 * @param { string } api
 * @param { object } data
 * @returns { Promise }
 */
export async function deletedata( api, data ) {
  const request = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify( data )
  }

  const url = rooturl + api
  const response = await fetch( url, request )
  
  if( !response.ok ) {
    throw new Error( `DELETE request failed with status: ${response.status}` )
  }
  
  return await response.json()
}