import * as p from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.25/prax.mjs'
import { tags } from './data/data-books.js'

const {E} = p.Ren.native()

// Render tags
const divs = document.getElementsByClassName(`book`)

class MyCheck extends HTMLInputElement {
    render(name) {
        this.onchange = this.onChange
        return E.label.props({name: `tags`, class: `button-filter`}).chi(
            E.input.props({type: `checkbox`}).chi()
        )
    }
    onChange(event) {
      console.log(this.value)
  
      for (const elem of divs) {
        const data = elem.getAttribute('data-index')
        if (data.includes(this.value)) {
          elem.hidden = false
        } else {
          elem.hidden = true
        }
      }
    }
}
customElements.define('my-check', MyCheck, {extends: 'input'})
    
// Render form
class MyTags extends HTMLFormElement {
    render() {
      for (const name of tags) {
        this.appendChild(new MyCheck().render(name))
      }
    }
    onChange() {
      const data = new FormData(this) 
      for (const elem of divs) {
        if (data.getAll('tags').length < 1) {
          elem.hidden = false
          console.log("FormData is empty")
        } else {
          console.log("FormData contains data")
        }
      }
      console.log(data.getAll('tags'))
    }
    connectedCallback() {
      this.onchange = this.onChange
      this.setAttribute('class', 'my-tags')
      this.render()
    }
}
customElements.define('my-tags', MyTags, {extends: 'form'})

// Render search
const searchInput = document.getElementById("searchInput")
const searchButton = document.getElementById("searchButton")

function searchData(input) {
  const divs = document.getElementsByClassName('book')
  for (const elem of divs) {
    let result = elem.innerHTML.toLowerCase().includes(input)
    if (result) {
      elem.hidden = false
    } else {
      elem.hidden = true
    } 
  }
}
searchButton.addEventListener('click', () => {
  const userInput = searchInput.value.toLowerCase()
  searchData(userInput)
})

// Enter click
document.addEventListener('keydown', function(event) {
  if (event.keyCode === 13) {
      document.getElementById('searchButton').click()
      event.preventDefault()
  }
})

const ibri = document.querySelectorAll('[id="ibri"]')
for (let val of ibri) {
  val.setAttribute('target', '_blank')
}