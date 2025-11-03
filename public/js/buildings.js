import { getdata, putdata } from "./api.js"
import { showform, getformfieldvalue, setformfieldvalue, clearform, gettablebody, cleartablerows } from "./form.js"
import { findancestorbytype } from "./dom.js"
import { showNotification, showNotesModal } from "./modals.js"

let currenteditingid = null

document.addEventListener( "DOMContentLoaded", async function() {
  document.getElementById( "addbuilding" ).addEventListener( "click", addbuildinginput )
  await gobuildings()
} )

/**
 * Fetch all buildings from the API
 * @returns { Promise< Array< object > > }
 */
async function fetchbuildings() {
  return await getdata( "buildings" )
}

/**
 * Fetch all landlords from the API
 * @returns { Promise< Array< object > > }
 */
async function fetchlandlords() {
  return await getdata( "landlords" )
}

/**
 * Add a new building via the API
 * @param { string } name
 * @param { string } address
 * @param { number } landlordId
 * @param { string } notes
 * @returns { Promise< object > }
 */
async function addbuilding( name, address, landlordId, notes ) {
  await putdata( "buildings", { name, address, landlord_id: landlordId, notes } )
}

/**
 * Update an existing building via the API
 * @param { number } id 
 * @param { string } name 
 * @param { string } address 
 * @param { number } landlordId 
 * @param { string } notes 
 * @returns { Promise< object > }
 */
async function updatebuilding( id, name, address, landlordId, notes ) {
  await putdata( "buildings", { id, name, address, landlord_id: landlordId, notes } )
}

/**
 * Delete a building via the API
 * @param { number } id
 * @returns { Promise< object > }
 */
async function deletebuilding( id ) {
  const response = await fetch( `${window.location.protocol}//${window.location.host}/api/buildings`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify( { id } )
  } )
  return await response.json()
}

/**
 * Refresh the buildings table with current data from the database
 * @returns { Promise }
 */
async function gobuildings() {
  const buildings = await fetchbuildings()
  cleartablerows( "buildingstable" )

  for( const building of buildings ) {
    addbuildingdom( building )
  }
}

/**
 * Populate the landlord dropdown in the building form
 * @returns { Promise }
 */
async function populatelandlorddropdown() {
  const landlords = await fetchlandlords()
  const select = document.getElementById( "buildingform-landlord" )
  
  select.innerHTML = '<option value="">-- Select Landlord --</option>'
  
  for( const landlord of landlords ) {
    const option = document.createElement( "option" )
    option.value = landlord.id
    option.textContent = landlord.name
    select.appendChild( option )
  }
}

/**
 * Show the form to add a new building
 */
async function addbuildinginput() {
  clearform( "buildingform" )
  await populatelandlorddropdown()
  currenteditingid = null
  
  showform( "buildingform", async () => {
    try {
      const name = getformfieldvalue( "buildingform-name" )
      const address = getformfieldvalue( "buildingform-address" )
      const landlordId = getformfieldvalue( "buildingform-landlord" )
      const notes = getformfieldvalue( "buildingform-notes" )
      
      if( !name || !address || !landlordId ) {
        showNotification( "Missing Information", "Please fill in all required fields (Name, Address, and Landlord).", "error" )
        return
      }
      
      await addbuilding( name, address, landlordId || null, notes )
      showNotification( "Success", "Building added successfully!", "success" )
      await gobuildings()
    } catch( error ) {
      showNotification( "Error", "Failed to add building. Please try again.", "error" )
      console.error( error )
    }
  } )
}

/**
 * Show the form to edit an existing building
 * @param { Event } ev - The click event from the edit button
 */
async function editbuilding( ev ) {
  clearform( "buildingform" )
  await populatelandlorddropdown()
  
  const buildingrow = findancestorbytype( ev.target, "tr" )
  const building = buildingrow.building
  currenteditingid = building.id
  
  setformfieldvalue( "buildingform-name", building.name || "" )
  setformfieldvalue( "buildingform-address", building.address || "" )
  setformfieldvalue( "buildingform-landlord", building.landlord_id || "" )
  setformfieldvalue( "buildingform-notes", building.notes || "" )
  
  showform( "buildingform", async () => {
    try {
      const name = getformfieldvalue( "buildingform-name" )
      const address = getformfieldvalue( "buildingform-address" )
      const landlordId = getformfieldvalue( "buildingform-landlord" )
      const notes = getformfieldvalue( "buildingform-notes" )
      
      if( !name || !address || !landlordId ) {
        showNotification( "Missing Information", "Please fill in all required fields (Name, Address, and Landlord).", "error" )
        return
      }
      
      await updatebuilding( currenteditingid, name, address, landlordId || null, notes )
      showNotification( "Success", "Building updated successfully!", "success" )
      currenteditingid = null
      await gobuildings()
    } catch( error ) {
      showNotification( "Error", "Failed to update building. Please try again.", "error" )
      console.error( error )
    }
  } )
}

/**
 * Delete a building
 * @param { Event } ev - The click event from the delete button
 */
async function removebuilding( ev ) {
  const buildingrow = findancestorbytype( ev.target, "tr" )
  const building = buildingrow.building
  
  if( confirm( `Are you sure you want to delete ${building.name}?` ) ) {
    try {
      await deletebuilding( building.id )
      showNotification( "Success", "Building deleted successfully!", "success" )
      await gobuildings()
    } catch( error ) {
      showNotification( "Error", "Failed to delete building. Please try again.", "error" )
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
 * Add a building row to the DOM table
 * @param { object } building - The building object to display
 */
export function addbuildingdom( building ) {
  const table = gettablebody( "buildingstable" )
  const newrow = table.insertRow()

  const cells = []
  for( let i = 0; i < 5; i++ ) {
    cells.push( newrow.insertCell( i ) )
  }

  newrow.building = building
  
  cells[ 0 ].innerText = building.name
  cells[ 1 ].innerText = building.address || ""
  cells[ 2 ].innerText = building.landlord_name || ""
  
  // Notes - truncated with click to view full
  if( building.notes && building.notes.trim() !== "" ) {
    const truncated = truncatenotes( building.notes, 40 )
    const notesCell = cells[ 3 ]
    
    if( building.notes.length > 40 ) {
      notesCell.innerHTML = `<span class="notes-truncated" style="cursor: pointer; color: #6366f1; text-decoration: underline;">${truncated}</span>`
      notesCell.addEventListener( "click", () => {
        showNotesModal( building.notes )
      } )
    } else {
      notesCell.innerText = building.notes
    }
  } else {
    cells[ 3 ].innerText = ""
  }

  const editbutton = document.createElement( "button" )
  editbutton.textContent = "Edit"
  editbutton.addEventListener( "click", editbuilding )

  const deletebutton = document.createElement( "button" )
  deletebutton.textContent = "Delete"
  deletebutton.addEventListener( "click", removebuilding )
  deletebutton.style.marginLeft = "5px"

  cells[ 4 ].appendChild( editbutton )
  cells[ 4 ].appendChild( deletebutton )
}