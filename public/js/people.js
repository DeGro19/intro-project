import { getdata, putdata, deletedata } from "./api.js"
import { showform, getformfieldvalue, setformfieldvalue, clearform, gettablebody, cleartablerows } from "./form.js"
import { findancestorbytype } from "./dom.js"
import { showNotification, showNotesModal } from "./modals.js"

let currenteditingid = null

document.addEventListener( "DOMContentLoaded", async function() {
  document.getElementById( "addperson" ).addEventListener( "click", addpersoninput )
  await gopeople()
} )

/**
 * Fetch all people from the API
 * @returns { Promise< Array< object > > }
 */
async function fetchpeople() {
  return await getdata( "people" )
}

/**
 * Fetch all rooms from the API
 * @returns { Promise< Array< object > > }
 */
async function fetchrooms() {
  return await getdata( "rooms" )
}

/**
 * Fetch schedules for a person
 * @param { number } personId
 * @returns { Promise< Array< object > > }
 */
async function fetchschedules( personId ) {
  return await getdata( `schedules?person_id=${personId}` )
}

/**
 * Fetch all schedules
 * @returns { Promise< Array< object > > }
 */
async function fetchallschedules() {
  return await getdata( "schedules" )
}

/**
 * Add a new person via the API
 * @param { string } name
 * @param { string } email
 * @param { string } notes
 * @returns { Promise< object > }
 */
async function addperson( name, email, notes ) {
  await putdata( "people", { name, email, notes } )
}

/**
 * Update an existing person via the API
 * @param { number } id 
 * @param { string } name 
 * @param { string } email 
 * @param { string } notes 
 * @returns { Promise< object > }
 */
async function updateperson( id, name, email, notes ) {
  await putdata( "people", { id, name, email, notes } )
}

/**
 * Delete a person via the API
 * @param { number } id
 * @returns { Promise< object > }
 */
async function deleteperson( id ) {
  const response = await fetch( `${window.location.protocol}//${window.location.host}/api/people`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify( { id } )
  } )
  return await response.json()
}

/**
 * Add or update a schedule
 * @param { number } personId
 * @param { number } roomId
 * @param { number } dayOfWeek
 * @returns { Promise< object > }
 */
async function saveschedule( personId, roomId, dayOfWeek ) {
  await putdata( "schedules", { person_id: personId, room_id: roomId, day_of_week: dayOfWeek, week_offset: 0 } )
}

/**
 * Delete a schedule
 * @param { number } scheduleId
 * @returns { Promise< object > }
 */
async function deleteschedule( scheduleId ) {
  await deletedata( "schedules", { id: scheduleId } )
}

/**
 * Check if a person can be scheduled in a room on a given day
 * Prevents double-booking and validates room capacity PER DAY
 * @param { number } personId
 * @param { number } roomId
 * @param { number } dayOfWeek
 * @param { Array } allSchedules - All schedules in the system
 * @param { Array } allRooms - All rooms in the system
 * @returns { object } - { canSchedule: boolean, reason: string }
 */
function checkscheduleavailability( personId, roomId, dayOfWeek, allSchedules, allRooms ) {
  // Check for double-booking - same person already scheduled that day
  const personAlreadyScheduled = allSchedules.some( s => 
    s.person_id === personId && s.day_of_week === dayOfWeek && s.room_id !== roomId
  )
  
  if( personAlreadyScheduled ) {
    return {
      canSchedule: false,
      reason: "This person is already scheduled for another room on this day. Please remove that schedule first."
    }
  }

  // Check room capacity FOR THIS SPECIFIC DAY
  const room = allRooms.find( r => r.id === roomId )
  if( room ) {
    // Count only schedules for this room on this specific day
    const roomOccupancyForDay = allSchedules.filter( s => 
      s.room_id === roomId && s.day_of_week === dayOfWeek
    ).length
    
    if( roomOccupancyForDay >= room.capacity ) {
      return {
        canSchedule: false,
        reason: `This room has reached its capacity for this day (${room.capacity} people). Current occupancy: ${roomOccupancyForDay}/${room.capacity}`
      }
    }
  }

  return { canSchedule: true, reason: "" }
}

/**
 * Refresh the people table with current data from the database
 * FIXED: Ensures proper clearing and prevents duplicates
 * @returns { Promise }
 */
async function gopeople() {
  const people = await fetchpeople()
  const tbody = gettablebody( "peopletable" )
  
  // FIXED: Clear all existing rows properly
  if( tbody ) {
    // Remove all rows except the header
    while( tbody.rows.length > 0 ) {
      tbody.deleteRow( 0 )
    }
  }

  // Add each person to the table
  for( const person of people ) {
    await addpersondom( person )
  }
}

/**
 * Show the form to add a new person
 */
function addpersoninput() {
  clearform( "personform" )
  currenteditingid = null
  
  showform( "personform", async () => {
    try {
      const name = getformfieldvalue( "personform-name" )
      const email = getformfieldvalue( "personform-email" )
      const notes = getformfieldvalue( "personform-notes" )
      
      if( !name || !email ) {
        showNotification( "Missing Information", "Please fill in all required fields (Name and Email).", "error" )
        return
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if( !emailRegex.test( email ) ) {
        showNotification( "Invalid Email", "Please enter a valid email address.", "error" )
        return
      }
      
      await addperson( name, email, notes )
      showNotification( "Success", "Person added successfully!", "success" )
      await gopeople()
    } catch( error ) {
      showNotification( "Error", "Failed to add person. Please try again.", "error" )
      console.error( error )
    }
  } )
}

/**
 * Show the form to edit an existing person
 * @param { Event } ev - The click event from the edit button
 */
function editperson( ev ) {
  clearform( "personform" )
  
  const personrow = findancestorbytype( ev.target, "tr" )
  const person = personrow.person
  
  currenteditingid = person.id
  
  setformfieldvalue( "personform-name", person.name || "" )
  setformfieldvalue( "personform-email", person.email || "" )
  setformfieldvalue( "personform-notes", person.notes || "" )
  
  showform( "personform", async () => {
    try {
      const name = getformfieldvalue( "personform-name" )
      const email = getformfieldvalue( "personform-email" )
      const notes = getformfieldvalue( "personform-notes" )
      
      if( !name || !email ) {
        showNotification( "Missing Information", "Please fill in all required fields (Name and Email).", "error" )
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if( !emailRegex.test( email ) ) {
        showNotification( "Invalid Email", "Please enter a valid email address.", "error" )
        return
      }
      
      await updateperson( currenteditingid, name, email, notes )
      showNotification( "Success", "Person updated successfully!", "success" )
      currenteditingid = null
      await gopeople()
    } catch( error ) {
      showNotification( "Error", "Failed to update person. Please try again.", "error" )
      console.error( error )
    }
  } )
}

/**
 * Delete a person
 * @param { Event } ev - The click event from the delete button
 */
async function removeperson( ev ) {
  const personrow = findancestorbytype( ev.target, "tr" )
  const person = personrow.person
  
  if( confirm( `Are you sure you want to delete ${person.name}?` ) ) {
    try {
      await deleteperson( person.id )
      showNotification( "Success", "Person deleted successfully!", "success" )
      await gopeople()
    } catch( error ) {
      showNotification( "Error", "Failed to delete person. Please try again.", "error" )
      console.error( error )
    }
  }
}

/**
 * Handle clicking on a schedule cell
 * @param { Event } ev - The click event
 */
async function handleschedulecellclick( ev ) {
  const cell = ev.target
  const personrow = findancestorbytype( cell, "tr" )
  const person = personrow.person
  
  const dayOfWeek = parseInt( cell.getAttribute( "data-day" ) || "0" )
  const scheduleId = cell.getAttribute( "data-schedule-id" ) || null
  
  if( scheduleId ) {
    // Already has a schedule - ask to remove
    if( confirm( "Remove this room assignment?" ) ) {
      try {
        await deleteschedule( parseInt( scheduleId ) )
        showNotification( "Success", "Schedule removed successfully!", "success" )
        await gopeople()
      } catch( error ) {
        showNotification( "Error", "Failed to remove schedule. Please try again.", "error" )
        console.error( error )
      }
    }
  } else {
    // No schedule - show room selector
    await showroomselector( person.id, dayOfWeek, cell )
  }
}

/**
 * Show room selector for scheduling with validation
 * @param { number } personId
 * @param { number } dayOfWeek
 * @param { HTMLElement } cell
 */
async function showroomselector( personId, dayOfWeek, cell ) {
  const rooms = await fetchrooms()
  const allSchedules = await fetchallschedules()
  
  if( 0 === rooms.length ) {
    showNotification( "No Rooms Available", "Please create rooms first.", "warning" )
    return
  }
  
  const select = document.createElement( "select" )
  select.style.width = "100%"
  select.style.padding = "0.5rem"
  select.style.borderRadius = "8px"
  
  const defaultOption = document.createElement( "option" )
  defaultOption.value = ""
  defaultOption.textContent = "-- Select Room --"
  select.appendChild( defaultOption )
  
  for( const room of rooms ) {
    const option = document.createElement( "option" )
    option.value = room.id
    
    // Calculate current occupancy
    const occupancy = allSchedules.filter( s => 
      s.room_id === room.id && s.day_of_week === dayOfWeek
    ).length
    
    const capacityStatus = occupancy >= room.capacity ? " [FULL]" : ` [${occupancy}/${room.capacity}]`
    
    option.textContent = `${room.building_name} - ${room.name}${capacityStatus}`
    option.disabled = occupancy >= room.capacity
    
    select.appendChild( option )
  }
  
  // Store original cell content
  const originalContent = cell.innerHTML
  
  cell.innerHTML = ""
  cell.appendChild( select )
  select.focus()
  
  select.addEventListener( "change", async () => {
    if( select.value ) {
      const selectedRoomId = parseInt( select.value )
      
      // Validate availability
      const availability = checkscheduleavailability( 
        personId, 
        selectedRoomId, 
        dayOfWeek, 
        allSchedules, 
        rooms 
      )
      
      if( !availability.canSchedule ) {
        showNotification( "Booking Conflict", availability.reason, "error" )
        cell.innerHTML = originalContent
        return
      }
      
      try {
        await saveschedule( personId, selectedRoomId, dayOfWeek )
        showNotification( "Success", "Schedule added successfully!", "success" )
        await gopeople()
      } catch( error ) {
        showNotification( "Error", "Failed to save schedule. Please try again.", "error" )
        console.error( error )
        cell.innerHTML = originalContent
      }
    } else {
      cell.innerHTML = originalContent
    }
  } )
  
  select.addEventListener( "blur", async () => {
    // Only restore if no selection was made
    if( !select.value ) {
      cell.innerHTML = originalContent
    }
  } )
}

/**
 * Add a person row to the DOM table
 * @param { object } person - The person object to display
 */
export async function addpersondom( person ) {
  const table = gettablebody( "peopletable" )
  const newrow = table.insertRow()

  const cells = []
  for( let i = 0; i < 9; i++ ) {
    cells.push( newrow.insertCell( i ) )
  }

  newrow.person = person
  cells[ 0 ].innerText = person.name

  const schedules = await fetchschedules( person.id )
  
  const scheduleMap = {}
  for( const schedule of schedules ) {
    scheduleMap[ schedule.day_of_week ] = schedule
  }

  for( let day = 0; day < 7; day++ ) {
    const scheduleCell = cells[ day + 1 ]
    scheduleCell.style.cursor = "pointer"
    scheduleCell.style.textAlign = "center"
    scheduleCell.setAttribute( "data-day", day )
    
    if( scheduleMap[ day ] ) {
      const schedule = scheduleMap[ day ]
      scheduleCell.innerText = `${schedule.building_name} - ${schedule.room_name}`
      scheduleCell.style.backgroundColor = "#e8f5e9"
      scheduleCell.setAttribute( "data-schedule-id", schedule.id )
    } else {
      scheduleCell.innerText = "+"
      scheduleCell.style.color = "#999"
    }
    
    scheduleCell.addEventListener( "click", handleschedulecellclick )
  }

  const editbutton = document.createElement( "button" )
  editbutton.textContent = "Edit"
  editbutton.addEventListener( "click", editperson )

  const deletebutton = document.createElement( "button" ) 
  deletebutton.textContent = "Delete"
  deletebutton.addEventListener( "click", removeperson )
  deletebutton.style.marginLeft = "5px"

  cells[ 8 ].appendChild( editbutton )
  cells[ 8 ].appendChild( deletebutton )
}