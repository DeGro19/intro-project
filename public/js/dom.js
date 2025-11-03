



/**
 * 
 * @param { object } element 
 * @param { string } className 
 * @returns 
 */
export function findancestorbyclass( element, className ) {

  let currentElement = element

  while( currentElement && !currentElement.classList.contains( className ) ) {
    currentElement = currentElement.parentNode
  }

  return currentElement;
}

/**
 * 
 * @param { object } element 
 * @param { string } type 
 * @returns { object }
 */
export function findancestorbytype( element, type ) {
  let currentElement = element
  const lowertype = type.toLowerCase()
  while ( currentElement && currentElement.tagName && currentElement.tagName.toLowerCase() !== lowertype ) {
      currentElement = currentElement.parentNode
  }

  return currentElement;
}