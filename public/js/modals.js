/**
 * Show a notification modal
 * @param { string } title
 * @param { string } message
 * @param { string } type - 'success', 'error', 'warning', 'info'
 * @param { function } onClose - Optional callback
 */
export function showNotification( title, message, type = "info", onClose = null ) {
  const modal = document.createElement( "div" )
  modal.className = "notification-modal"
  modal.setAttribute( "data-type", type )

  const iconMap = {
    success: "✓",
    error: "✗",
    warning: "⚠",
    info: "ℹ"
  }

  const icon = iconMap[ type ] || "ℹ"

  modal.innerHTML = `
    <div class="notification-content">
      <div class="notification-icon">${icon}</div>
      <div class="notification-body">
        <h3 class="notification-title">${title}</h3>
        <p class="notification-message">${message}</p>
      </div>
      <button class="notification-close" aria-label="Close notification">×</button>
    </div>
  `

  document.body.appendChild( modal )

  const closeBtn = modal.querySelector( ".notification-close" )
  const closeNotification = () => {
    modal.classList.add( "closing" )
    setTimeout( () => {
      modal.remove()
      if( onClose ) onClose()
    }, 300 )
  }

  closeBtn.addEventListener( "click", closeNotification )
  
  // Auto-close after 5 seconds for non-error messages
  if( type !== "error" ) {
    setTimeout( closeNotification, 5000 )
  }

  return modal
}

/**
 * Show notes modal popup
 * @param { string } notes
 */
export function showNotesModal( notes ) {
  const overlay = document.createElement( "div" )
  overlay.className = "notes-modal-overlay"

  const modal = document.createElement( "div" )
  modal.className = "notes-modal-container"

  modal.innerHTML = `
    <div class="notes-modal">
      <div class="notes-modal-header">
        <h2>Full Notes</h2>
        <button class="notes-modal-close" aria-label="Close">×</button>
      </div>
      <div class="notes-modal-body">
        <p>${notes.replace( /\n/g, "<br>" )}</p>
      </div>
      <div class="notes-modal-footer">
        <button class="btn-primary notes-modal-done">Done</button>
      </div>
    </div>
  `

  overlay.appendChild( modal )
  document.body.appendChild( overlay )

  const closeBtn = modal.querySelector( ".notes-modal-close" )
  const doneBtn = modal.querySelector( ".notes-modal-done" )

  const closeModal = () => {
    overlay.classList.add( "closing" )
    setTimeout( () => overlay.remove(), 300 )
  }

  closeBtn.addEventListener( "click", closeModal )
  doneBtn.addEventListener( "click", closeModal )
  overlay.addEventListener( "click", ( e ) => {
    if( e.target === overlay ) closeModal()
  } )
}