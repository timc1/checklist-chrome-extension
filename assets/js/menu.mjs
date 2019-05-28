const menuRoot = document.querySelector('div.menu-container')
const menuToggler = document.querySelector('button.menu-toggle')
const main = document.querySelector('main')

const state = {
  days: [],
  isMenuOpen: false,
  howManyDaysToShow: 5,
}

/*
 * [
 *   {
 *     id: '05/29/2019',
 *     list: [
 *       'hi',
 *       'friends',
 *       'what am i doing w my life?'
 *     ]
 *    }
 * ]
 *
 */

export default function setupMenu() {
  // Add event listener to menuToggler.
  menuToggler.addEventListener('click', handleToggleMenu)

  try {
    const data = localStorage.getItem('all_days')
    if (data === null) {
      state.days = []
      localStorage.setItem('all_days', '[]')
    } else {
      state.days = JSON.parse(data).map(day => ({
        id: day.id,
        items: day.items,
      }))
    }
  } catch (err) {
    state.days = []
    localStorage.setItem('all_days', '[]')
  }

  // Render the latest 5 days into ul.menu
  renderDayMarkupToDOM(state.days.slice(state.howManyDaysToShow * -1))
}

function handleToggleMenu(e) {
  if (e) e.stopPropagation()
  if (state.isMenuOpen) {
    state.isMenuOpen = false
    menuRoot.classList.remove('menu-open')
    main.removeAttribute('class')
    window.removeEventListener('mousedown', handleOuterClick)
    window.removeEventListener('keydown', handleKeyDown)
  } else {
    state.isMenuOpen = true
    menuRoot.classList.add('menu-open')
    main.classList.add('blur')
    window.addEventListener('mousedown', handleOuterClick)
    window.addEventListener('keydown', handleKeyDown)

    // Scroll days down to bottom.
    const menu = menuRoot.querySelector('ul.menu')
    menu.scrollTop = menu.scrollHeight
  }
}

function handleOuterClick(e) {
  if (state.isMenuOpen) {
    const target = e.target
    if (!menuRoot.contains(target) && target !== menuToggler) {
      handleToggleMenu(null)
    }
  }
}

function handleKeyDown(e) {
  if (e.key === `Escape` && state.isMenuOpen) {
    handleToggleMenu(null)
  }
}

function renderDayMarkupToDOM(items) {
  const menu = menuRoot.querySelector('ul.menu')

  const markup = items.map(i => getItemMarkup(i)).reverse()

  if (items.length) {
    markup.forEach(m => menu.prepend(m))
  } else {
    let li = document.createElement('li')
    li.innerHTML = `
      Check off completed tasks as you finish them. Your record will be shown here by each date.
    `
    menu.appendChild(li)
  }
}

function getItemMarkup(item) {
  const li = document.createElement('li')
  li.setAttribute('class', 'menu-day')

  console.log('item', item)
  li.innerHTML = `
    <p>${item.id}</p>  
    <ul>
      ${item.items.map(i => `<li>${i}</li>`).join('')} 
    </ul>
  `

  return li
}

// Updates state.days to reflect checkbox clicks, and updates localStorage
// to reflect the change.
export function updateDaysList(actionType, payload) {
  const now = new Date().toLocaleDateString()

  // Update state.days.
  console.log('actionType', actionType, 'payload', payload, now)
  const currentDay = state.days[state.days.length - 1]
  switch (actionType) {
    case 'ADD': {
      if (currentDay === undefined || currentDay.id !== now) {
        state.days.push({
          id: now,
          items: [payload],
        })
        // Append new date to DOM.
        menuRoot.querySelector('.menu').appendChild(
          getItemMarkup({
            id: now,
            items: [payload],
          })
        )
      } else if (currentDay.id === now) {
        state.days[state.days.length - 1].items.push(payload)
        // Append new value to latest date.
        const lastElement = menuRoot.querySelector('.menu-day:last-of-type ul')
        const li = document.createElement('li')
        li.innerText = payload
        lastElement.appendChild(li)
      }
      break
    }
    default:
      throw new Error(`No actionType of ${actionType} found.`)
  }

  localStorage.setItem('all_days', JSON.stringify(state.days))

  // Update localStorage to reflect state.days
}