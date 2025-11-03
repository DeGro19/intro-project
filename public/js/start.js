import './people.js'
import './landlords.js'
import './buildings.js'
import './rooms.js'
import './form.js'


document.addEventListener( "DOMContentLoaded", function() {
  configurepeopleheaders()
} )


const daynames = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ]

function configurepeopleheaders() {
  let currentdate = new Date()

  // Calculate the difference in days to get to Sunday (start of week)
  // getDay() returns 0 for Sunday, 1 for Monday, etc.
  let dayofweek = currentdate.getDay()
  
  // If it's not Sunday (0), calculate days back to Sunday
  let daysToSunday = dayofweek // e.g., if today is Wednesday (3), go back 3 days
  
  // Adjust the date to Sunday of this week
  currentdate.setDate( currentdate.getDate() - daysToSunday )

  const days = document.getElementsByClassName( "days" )
  for ( let i = 0; i < days.length; i++ ) {
    // Day 1 (Sunday)
    days[ i ].querySelectorAll( ".day-1" )[ 0 ].textContent = daynames[ currentdate.getDay() ] + " " + currentdate.getDate()
    currentdate.setDate( currentdate.getDate() + 1 )
    
    // Day 2 (Monday)
    days[ i ].querySelectorAll( ".day-2" )[ 0 ].textContent = daynames[ currentdate.getDay() ] + " " + currentdate.getDate()
    currentdate.setDate( currentdate.getDate() + 1 )
    
    // Day 3 (Tuesday)
    days[ i ].querySelectorAll( ".day-3" )[ 0 ].textContent = daynames[ currentdate.getDay() ] + " " + currentdate.getDate()
    currentdate.setDate( currentdate.getDate() + 1 )
    
    // Day 4 (Wednesday)
    days[ i ].querySelectorAll( ".day-4" )[ 0 ].textContent = daynames[ currentdate.getDay() ] + " " + currentdate.getDate()
    currentdate.setDate( currentdate.getDate() + 1 )
    
    // Day 5 (Thursday)
    days[ i ].querySelectorAll( ".day-5" )[ 0 ].textContent = daynames[ currentdate.getDay() ] + " " + currentdate.getDate()
    currentdate.setDate( currentdate.getDate() + 1 )
    
    // Day 6 (Friday)
    days[ i ].querySelectorAll( ".day-6" )[ 0 ].textContent = daynames[ currentdate.getDay() ] + " " + currentdate.getDate()
    currentdate.setDate( currentdate.getDate() + 1 )
    
    // Day 7 (Saturday)
    days[ i ].querySelectorAll( ".day-7" )[ 0 ].textContent = daynames[ currentdate.getDay() ] + " " + currentdate.getDate()
    
    // Reset for next iteration (if multiple tables)
    currentdate.setDate( currentdate.getDate() - 6 )
  }
}