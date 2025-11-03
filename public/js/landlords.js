import { getdata, putdata } from "./api.js"
import { showform, getformfieldvalue, setformfieldvalue, clearform, gettablebody, cleartablerows } from "./form.js"
import { findancestorbytype } from "./dom.js"
import { showNotification, showNotesModal } from "./modals.js"

let currenteditingid = null

document.addEventListener( "DOMContentLoaded", async function() {
  document.getElementById( "addlandlord" ).addEventListener( "click", addlandlordinput )
  await golandlords()
} )

/**
 * Fetch all landlords from the API
 * @returns { Promise< Array< object > > }
 */
async function fetchlandlords() {
  return await getdata( "landlords" )
}

/**
 * Add a new landlord via the API
 * @param { string } name
 * @param { string } email
 * @param { string } phone
 * @param { string } notes
 * @returns { Promise< object > }
 */
async function addlandlord( name, email, phone, notes ) {
  await putdata( "landlords", { name, email, phone, notes } )
}

/**
 * Update an existing landlord via the API
 * @param { number } id 
 * @param { string } name 
 * @param { string } email 
 * @param { string } phone 
 * @param { string } notes 
 * @returns { Promise< object > }
 */
async function updatelandlord( id, name, email, phone, notes ) {
  await putdata( "landlords", { id, name, email, phone, notes } )
}

/**
 * Delete a landlord via the API
 * @param { number } id
 * @returns { Promise< object > }
 */
async function deletelandlord( id ) {
  const response = await fetch( `${window.location.protocol}//${window.location.host}/api/landlords`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify( { id } )
  } )
  return await response.json()
}

/**
 * Refresh the landlords table with current data from the database
 * @returns { Promise }
 */
async function golandlords() {
  const l = await fetchlandlords()
  cleartablerows( "landlordstable" )

  for( const li in l ) {
    addlandlorddom( l[ li ] )
  }
}

/**
 * Show the form to add a new landlord
 */
function addlandlordinput() {
  clearform( "landlordform" )
  currenteditingid = null
  
  showform( "landlordform", async () => {
    try {
      const name = getformfieldvalue( "landlordform-name" )
      const email = getformfieldvalue( "landlordform-email" )
      const phone = getformfieldvalue( "landlordform-phone" )
      const notes = getformfieldvalue( "landlordform-notes" )
      
      if( !name || !email || !phone ) {
        showNotification( "Missing Information", "Please fill in all required fields (Name, Email, and Phone).", "error" )
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if( !emailRegex.test( email ) ) {
        showNotification( "Invalid Email", "Please enter a valid email address.", "error" )
        return
      }

      const phoneRegex = /^[\d\s\-\+\(\)]+$/
      if( !phoneRegex.test( phone ) || phone.length < 7 ) {
        showNotification( "Invalid Phone", "Please enter a valid phone number.", "error" )
        return
      }
      
      await addlandlord( name, email, phone, notes )
      showNotification( "Success", "Landlord added successfully!", "success" )
      await golandlords()
    } catch( error ) {
      showNotification( "Error", "Failed to add landlord. Please try again.", "error" )
      console.error( error )
    }
  } )
}

/**
 * Show the form to edit an existing landlord
 * @param { Event } ev - The click event from the edit button
 */
function editlandlord( ev ) {
  clearform( "landlordform" )
  
  const landlordrow = findancestorbytype( ev.target, "tr" )
  const landlord = landlordrow.landlord
  
  currenteditingid = landlord.id
  
  setformfieldvalue( "landlordform-name", landlord.name || "" )
  setformfieldvalue( "landlordform-email", landlord.email || "" )
  setformfieldvalue( "landlordform-phone", landlord.phone || "" )
  setformfieldvalue( "landlordform-notes", landlord.notes || "" )
  
  showform( "landlordform", async () => {
    try {
      const name = getformfieldvalue( "landlordform-name" )
      const email = getformfieldvalue( "landlordform-email" )
      const phone = getformfieldvalue( "landlordform-phone" )
      const notes = getformfieldvalue( "landlordform-notes" )
      
      if( !name || !email || !phone ) {
        showNotification( "Missing Information", "Please fill in all required fields (Name, Email, and Phone).", "error" )
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if( !emailRegex.test( email ) ) {
        showNotification( "Invalid Email", "Please enter a valid email address.", "error" )
        return
      }

      const phoneRegex = /^[\d\s\-\+\(\)]+$/
      if( !phoneRegex.test( phone ) || phone.length < 7 ) {
        showNotification( "Invalid Phone", "Please enter a valid phone number.", "error" )
        return
      }
      
      await updatelandlord( currenteditingid, name, email, phone, notes )
      showNotification( "Success", "Landlord updated successfully!", "success" )
      currenteditingid = null
      await golandlords()
    } catch( error ) {
      showNotification( "Error", "Failed to update landlord. Please try again.", "error" )
      console.error( error )
    }
  } )
}

/**
 * Delete a landlord
 * @param { Event } ev - The click event from the delete button
 */
async function removelandlord( ev ) {
  const landlordrow = findancestorbytype( ev.target, "tr" )
  const landlord = landlordrow.landlord
  
  if( confirm( `Are you sure you want to delete ${landlord.name}?` ) ) {
    try {
      await deletelandlord( landlord.id )
      showNotification( "Success", "Landlord deleted successfully!", "success" )
      await golandlords()
    } catch( error ) {
      showNotification( "Error", "Failed to delete landlord. Please try again.", "error" )
      console.error( error )
    }
  }
}

/**
 * Truncate notes text for display
 * @param { string } notes
 * @param { number } maxLength
 * @returns { string }
 */
function truncatenotes( notes, maxLength = 40 ) {
  if( notes.length > maxLength ) {
    return notes.substring( 0, maxLength ) + "..."
  }
  return notes
}

/**
 * Add a landlord row to the DOM table
 * @param { object } landlord - The landlord object to display
 */
export function addlandlorddom( landlord ) {
  const table = gettablebody( "landlordstable" )
  const newrow = table.insertRow()

  const cells = []
  for( let i = 0; i < 5; i++ ) {
    cells.push( newrow.insertCell( i ) )
  }

  newrow.landlord = landlord
  
  cells[ 0 ].innerText = landlord.name
  cells[ 1 ].innerText = landlord.email || ""
  cells[ 2 ].innerText = landlord.phone || ""
  
  // Notes - truncated with click to view full
  if( landlord.notes && landlord.notes.trim() !== "" ) {
    const truncated = truncatenotes( landlord.notes, 40 )
    const notesCell = cells[ 3 ]
    
    if( landlord.notes.length > 40 ) {
      notesCell.innerHTML = `<span class="notes-truncated" style="cursor: pointer; color: #6366f1; text-decoration: underline;">${truncated}</span>`
      notesCell.addEventListener( "click", () => {
        showNotesModal( landlord.notes )
      } )
    } else {
      notesCell.innerText = landlord.notes
    }
  } else {
    cells[ 3 ].innerText = ""
  }

  const editbutton = document.createElement( "button" )
  editbutton.textContent = "Edit"
  editbutton.addEventListener( "click", editlandlord )

  const deletebutton = document.createElement( "button" )
  deletebutton.textContent = "Delete"
  deletebutton.addEventListener( "click", removelandlord )
  deletebutton.style.marginLeft = "5px"

  cells[ 4 ].appendChild( editbutton )
  cells[ 4 ].appendChild( deletebutton )
}