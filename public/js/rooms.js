import { getdata, putdata } from "./api.js"
import { showform, getformfieldvalue, setformfieldvalue, clearform, gettablebody, cleartablerows } from "./form.js"
import { findancestorbytype } from "./dom.js"
import { showNotification, showNotesModal } from "./modals.js"

let currenteditingid = null

document.addEventListener( "DOMContentLoaded", async function() {
  document.getElementById( "addroom" ).addEventListener( "click", addroominput )
  await gorooms()
} )

async function fetchrooms() {
  return await getdata( "rooms" )
}

async function fetchbuildings() {
  return await getdata( "buildings" )
}

async function fetchallschedules() {
  return await getdata( "schedules" )
}

async function addroom( name, buildingId, type, capacity, notes ) {
  console.log("Adding room with capacity:", capacity)
  const result = await putdata( "rooms", { 
    name, 
    building_id: buildingId, 
    type, 
    capacity: Number(capacity),
    notes 
  } )
  console.log("Room added:", result)
  return result
}

async function updateroom( id, name, buildingId, type, capacity, notes ) {
  console.log("Updating room with capacity:", capacity)
  const result = await putdata( "rooms", { 
    id, 
    name, 
    building_id: buildingId, 
    type, 
    capacity: Number(capacity),
    notes 
  } )
  console.log("Room updated:", result)
  return result
}

async function deleteroom( id ) {
  const response = await fetch( `${window.location.protocol}//${window.location.host}/api/rooms`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify( { id } )
  } )
  return await response.json()
}

/**
 * Calculate max occupancy per day for a room
 * @param {number} roomId - The room ID
 * @param {Array} schedules - All schedules
 * @returns {Object} - Object with day_of_week as key and count as value
 */
function calculateDailyOccupancy(roomId, schedules) {
  const dailyOccupancy = {}
  
  // Initialize all days to 0
  for(let day = 0; day < 7; day++) {
    dailyOccupancy[day] = 0
  }
  
  // Count schedules per day
  schedules.forEach(schedule => {
    if(schedule.room_id === roomId) {
      dailyOccupancy[schedule.day_of_week] = (dailyOccupancy[schedule.day_of_week] || 0) + 1
    }
  })
  
  return dailyOccupancy
}

/**
 * Get the maximum occupancy across all days
 * @param {Object} dailyOccupancy - Daily occupancy object
 * @returns {number} - Maximum occupancy
 */
function getMaxDailyOccupancy(dailyOccupancy) {
  return Math.max(...Object.values(dailyOccupancy))
}

export async function gorooms() {
  const rooms = await fetchrooms()
  const schedules = await fetchallschedules()
  
  console.log("Fetched rooms:", rooms)
  
  cleartablerows( "roomstable" )

  for( const room of rooms ) {
    // Calculate daily occupancy
    const dailyOccupancy = calculateDailyOccupancy(room.id, schedules)
    const maxOccupancy = getMaxDailyOccupancy(dailyOccupancy)
    
    addroomdom( room, maxOccupancy, dailyOccupancy )
  }
}

async function populatebuildingdropdown() {
  const buildings = await fetchbuildings()
  const select = document.getElementById( "roomform-building" )
  
  select.innerHTML = '<option value="">-- Select Building --</option>'
  
  for( const building of buildings ) {
    const option = document.createElement( "option" )
    option.value = building.id
    option.textContent = building.name
    select.appendChild( option )
  }
}

async function addroominput() {
  clearform( "roomform" )
  await populatebuildingdropdown()
  currenteditingid = null
  
  setformfieldvalue( "roomform-capacity", "1" )
  
  showform( "roomform", async () => {
    try {
      const name = getformfieldvalue( "roomform-name" )
      const buildingId = getformfieldvalue( "roomform-building" )
      const type = getformfieldvalue( "roomform-type" )
      const capacityStr = getformfieldvalue( "roomform-capacity" )
      const notes = getformfieldvalue( "roomform-notes" )
      
      if( !name || !buildingId || !type ) {
        showNotification( "Missing Information", "Please fill in all required fields (Name, Building, and Type).", "error" )
        return
      }

      const capacity = parseInt( capacityStr, 10 )
      
      if( isNaN( capacity ) || capacity < 1 ) {
        showNotification( "Invalid Capacity", "Room capacity must be a number of 1 or greater.", "error" )
        return
      }
      
      console.log("Submitting new room with capacity:", capacity)
      
      await addroom( name, buildingId, type, capacity, notes )
      showNotification( "Success", "Room added successfully!", "success" )
      await gorooms()
    } catch( error ) {
      showNotification( "Error", "Failed to add room. Please try again.", "error" )
      console.error( error )
    }
  } )
}

async function editroom( ev ) {
  clearform( "roomform" )
  await populatebuildingdropdown()
  
  const roomrow = findancestorbytype( ev.target, "tr" )
  const room = roomrow.room
  currenteditingid = room.id
  
  console.log("Editing room:", room)
  
  setformfieldvalue( "roomform-name", room.name || "" )
  setformfieldvalue( "roomform-building", room.building_id || "" )
  setformfieldvalue( "roomform-type", room.type || "" )
  
  const currentCapacity = room.capacity || 1
  setformfieldvalue( "roomform-capacity", String(currentCapacity) )
  
  setformfieldvalue( "roomform-notes", room.notes || "" )
  
  showform( "roomform", async () => {
    try {
      const name = getformfieldvalue( "roomform-name" )
      const buildingId = getformfieldvalue( "roomform-building" )
      const type = getformfieldvalue( "roomform-type" )
      const capacityStr = getformfieldvalue( "roomform-capacity" )
      const notes = getformfieldvalue( "roomform-notes" )
      
      if( !name || !buildingId || !type ) {
        showNotification( "Missing Information", "Please fill in all required fields (Name, Building, and Type).", "error" )
        return
      }

      const capacity = parseInt( capacityStr, 10 )
      
      if( isNaN( capacity ) || capacity < 1 ) {
        showNotification( "Invalid Capacity", "Room capacity must be a number of 1 or greater.", "error" )
        return
      }
      
      console.log("Submitting updated room with capacity:", capacity)
      
      await updateroom( currenteditingid, name, buildingId, type, capacity, notes )
      showNotification( "Success", "Room updated successfully!", "success" )
      currenteditingid = null
      await gorooms()
    } catch( error ) {
      showNotification( "Error", "Failed to update room. Please try again.", "error" )
      console.error( error )
    }
  } )
}

async function removeroom( ev ) {
  const roomrow = findancestorbytype( ev.target, "tr" )
  const room = roomrow.room
  
  if( confirm( `Are you sure you want to delete ${room.name}?` ) ) {
    try {
      await deleteroom( room.id )
      showNotification( "Success", "Room deleted successfully!", "success" )
      await gorooms()
    } catch( error ) {
      showNotification( "Error", "Failed to delete room. Please try again.", "error" )
      console.error( error )
    }
  }
}

function truncatenotes( notes, maxLength = 50 ) {
  if( !notes ) return ""
  if( notes.length > maxLength ) {
    return notes.substring( 0, maxLength ) + "..."
  }
  return notes
}

/**
 * Add a room row to the DOM table with daily occupancy display
 */
export function addroomdom( room, maxOccupancy = 0, dailyOccupancy = {} ) {
  const table = gettablebody( "roomstable" )
  const newrow = table.insertRow()

  const cells = []
  for( let i = 0; i < 6; i++ ) {
    cells.push( newrow.insertCell( i ) )
  }

  newrow.room = room
  
  cells[ 0 ].innerText = room.name || "Unnamed Room"
  cells[ 1 ].innerText = room.building_name || "Unknown Building"
  cells[ 2 ].innerText = room.type || "Unspecified"
  
  // Parse capacity safely
  let capacity = 1
  if (room.capacity !== undefined && room.capacity !== null) {
    const parsed = Number(room.capacity)
    if (Number.isFinite(parsed) && parsed > 0) {
      capacity = Math.floor(parsed)
    }
  }
  
  console.log(`Room ${room.name} - Capacity: ${capacity}, Max Daily Occupancy: ${maxOccupancy}`)
  
  // Build daily breakdown string
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dailyBreakdown = dayNames.map((day, index) => {
    const count = dailyOccupancy[index] || 0
    return `${day}: ${count}/${capacity}`
  }).join(' | ')
  
  const capacityAtRisk = maxOccupancy >= capacity
  const capacityNear = maxOccupancy >= ( capacity * 0.7 ) && maxOccupancy < capacity
  
  let capacityStyle = ""
  let capacityText = `${capacity} (Peak: ${maxOccupancy}/${capacity})`
  
  if( capacityAtRisk ) {
    capacityStyle = "color: #dc2626; font-weight: bold;"
    capacityText = `⚠️ ${capacity} (Peak: ${maxOccupancy}/${capacity} FULL)`
  } else if( capacityNear ) {
    capacityStyle = "color: #f59e0b; font-weight: bold;"
    capacityText = `⚠ ${capacity} (Peak: ${maxOccupancy}/${capacity})`
  }
  
  cells[ 3 ].innerHTML = `
    <span style="${capacityStyle}">${capacityText}</span>
    <br>
    <small style="color: #6b7280; font-size: 0.75rem;">${dailyBreakdown}</small>
  `
  
  // Notes
  if( room.notes && room.notes.trim() !== "" ) {
    const truncated = truncatenotes( room.notes, 50 )
    const notesCell = cells[ 4 ]
    
    if( room.notes.length > 50 ) {
      notesCell.innerHTML = `<span class="notes-truncated" style="cursor: pointer; color: #6366f1; text-decoration: underline;">${truncated}</span>`
      notesCell.addEventListener( "click", () => {
        showNotesModal( room.notes )
      } )
    } else {
      notesCell.innerText = room.notes
    }
  } else {
    cells[ 4 ].innerText = ""
  }

  // Action buttons
  const editbutton = document.createElement( "button" )
  editbutton.textContent = "Edit"
  editbutton.className = "btn-edit edit"
  editbutton.addEventListener( "click", editroom )

  const deletebutton = document.createElement( "button" )
  deletebutton.textContent = "Delete"
  deletebutton.className = "btn-delete delete"
  deletebutton.addEventListener( "click", removeroom )
  deletebutton.style.marginLeft = "5px"

  cells[ 5 ].appendChild( editbutton )
  cells[ 5 ].appendChild( deletebutton )
}