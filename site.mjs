/* global Deno */

import * as a from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.25/all.mjs'
import * as p from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.25/prax.mjs'
import * as dg from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.25/dom_glob_shim.mjs'
// import {paths as pt} from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.25/io_deno.mjs'
import * as pt from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.25/path.mjs'
import * as l from './live.mjs'

import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js'

import { contact, list, contactIbri } from './data/data.js'
import { books } from './data/data-books.js'
import { cheese } from './data/data-cheese.js'

const {E} = new p.Ren(dg.document).patchProto(dg.glob.Element)

const DEV = Deno.args.includes(`--dev`)

class Page extends a.Emp {
  constructor(site) {
    super()
    this.site = a.reqInst(site, Site)
  }

  urlPath() {return ``}

  fsPath() {
    const path = a.laxStr(this.urlPath())
    return path && a.stripPre(path, `/`) + `.html`
  }

  targetPath() {
    const path = a.laxStr(this.fsPath())
    return path && pt.posix.join(`target`, path)
  }

  title() {return ``}

  res() {return a.resBui().html(this.body()).res()}

  body() {return ``}

  
  async write() {
    const path = pt.toPosix(this.targetPath())
    if (!path) return

    const body = this.body()
    if (!body) return

    await Deno.mkdir(pt.posix.dir(path), {recursive: true})
    console.log(path)
    // console.log(pt.dir(path))
    await Deno.writeTextFile(path, body)

    console.log(`[html] wrote`, path)
  }
}

// 404 //
class Page404 extends Page {
  // Only for `Nav`.
  urlPath() {return `404`}
  fsPath() {return `404.html`}
  title() {return `Страница не найдена`}
  res() {return a.resBui().html(this.body()).code(404).res()}

  body() {
    return Layout(
      E.header.chi(Nav(this)),
      E.main.chi(
        E.h1.chi(this.title()),
        E.a.props({href: `/`, class: `error`}).chi(`Вернуться на главную`,
          E.img.props({alt: `Severin404`, src: `/images/severin404.jpg`, class: `error`})
        )        
      ),
      Footer(this)
    )
  }
}


// Main //
class PageIndex extends Page {
  urlPath() {return `/`}
  fsPath() {return `index.html`}
  title() {return `Главная`}

  body() {
  const principe =  Deno.readTextFileSync('./data/principe.md')

    return Layout(
      E.header.chi(Nav(this)),
      E.main.chi(
        E.aboutme.chi(E.h1.chi(`Северин Богучарский`)),
        E.lastart,
        E.principe.chi(new p.Raw(marked(principe)))
      ),
      Footer(this)
    )
  }
}

// Blog //
class PageBlog extends Page {
  urlPath() {return `/blog`}
  title() {return `Блог`}

  body() {
    return Layout(
      E.header.chi(Nav(this)),
      E.main.chi(
        E.blog.chi(
          list.map((val) => {
              return E.div.props({id: val.id, dataindex: val.dataindex}).chi(
                E.span.chi(val.date),
                E.a.props({href: '/blog/' + val.dataindex}).chi(
                  E.h3.chi(val.h3),
                  E.p.chi(val.p),
                  E.img.props({alt: val.alt, src: val.src})
                )
              )
            }
          )
        )
      ),
      Footer(this)
    )
  }
}


// Article //
class PageArticle extends Page {
    urlPath() {return `/blog/` + list[0].dataindex}
    title() {return list[0].dataindex}
  
    body() {
    const art1 = Deno.readTextFileSync(list[0].path)
    return Layout(
      E.header.chi(Nav(this)),
      E.main.chi(
        E.art.chi(new p.Raw(marked(art1)))
      ),
      Footer(this)
    )
  }
}

// Bookreview //
class PageBookreview extends Page {
  urlPath() {return `/bookreview`}
  title() {return `Обзоры книг`}

  body() {
    return Layout(
      E.header.chi(Nav(this)),
      E.main.chi(
        E.div.props({class: `info`}).chi(
          E.search.chi(
            E.label.props({for: `searchInput`}).chi(`Краткие оценки прочитанных мною книг`),
            E.div.chi(
              E.input.props({type: `text`, id: `searchInput`, placeholder: `Книга, автор, жанр...`}),
              E.button.props({id: `searchButton`, type: `submit`}).chi(`🔍`)
            )
          ),
          // E.form.props({class: `my-tags`, is: `my-tags`})
        ),
        E.books.chi(
          books.map((val) => {
            return E.div.props({class: `book`, dataindex: val.tags, id: val.Id}).chi(
              E.span.chi(val.Id),
              E.h3.chi(val.name),
              E.p.chi(`Автор: ` + val.author),
              E.p.chi(`Жанр: ` + val.genre),
              E.p.chi(`Дата: ` + val.date),
              E.p.chi(val.description),
              E.p.chi(`Мой рейтинг: ` + val.rating),
              E.span.chi(`Теги: ` + val.tags),
            )
          }
          )
        )
      ),
      Footer(this)
    )
  }
}

// Cheese //
class PageCheese extends Page {
  urlPath() {return `/cheese`}
  title() {return `Сыр`}

  body() {
    return Layout(
      E.header.chi(Nav(this)),
      E.main.chi(
        E.div.props({class: `info`}).chi(
          E.search.chi(
            E.label.props({for: `searchInput`}).chi(`Моя вторая профессия — сыродел. Составил небольшой каталог сыра. Только посмотрите, сколько существует видов :)`),
            E.div.chi(
              E.input.props({type: `text`, id: `searchInput`, placeholder: `Найти сыр...`}),
              E.button.props({id: `searchButton`, type: `submit`}).chi(`🔍`)
            )
          ),
          E.form.props({class: `my-tags`, is: `my-tags`})
        ),
        E.books.chi(
          cheese.map((val) => {
            return E.div.props({class: `book`, dataindex: val.tags, id: val.Id}).chi(
              E.span.chi(val.Id),
              E.h3.chi(val.name),
              E.p.chi(`Срок созревания: ` + val.age),
              E.p.chi(`Молоко: ` + val.milk),
              E.p.chi(`Первое упоминание: ` + val.since),
              E.p.chi(`Тип: ` + val.type),
              E.p.chi(`Вкус: ` + val.taste),
              E.p.chi(`Плесень: ` + val.mold),
              E.p.chi(`Описание: ` + val.description),
              E.span.chi(`Теги: ` + val.tags),
            )
          }
        )
        )
      ),
      Footer(this)
    )
  }
}

// Ibri //
class PageIbri extends Page {
  urlPath() {return `/ibri`}
  title() {return `Ibri®`}

  body() {
  const ibri = Deno.readTextFileSync('./data/ibri.md')
    return Layout(
      E.main.chi(
        E.aboutibri,
        E.principe.chi(new p.Raw(marked(ibri)))
      ),
      FooterIbri(this)
    )
  }
}

class Site extends a.Emp {
  constructor() {
    super()
    this.notFound = new Page404(this)
    this.nav = [new PageIndex(this), new PageBlog(this), new PageBookreview(this), new PageCheese(this), new PageIbri(this)]
    this.other = [new PageArticle(this)]
  }
  all() {return [this.notFound, ...this.nav, ...this.other]}  
}

export const site = new Site()

function Layout(...chi) {
  return p.renderDocument(
    E.html.chi(
      E.head.chi(
        E.meta.props({charset: `utf-8`}),
        E.meta.props({name: `viewport`, content: `width=device-width, initial-scale=1`}),
        E.title.chi(`Северин Богучарский`),
        E.link.props({rel: `icon`, type: `image/x-icon`, href: `/images/severin.ico`}),
        E.link.props({rel: `stylesheet`, href: `/main.css`}),
        E.link.props({rel: `preconnect`, href: `https://fonts.googleapis.com`}),
        E.link.props({rel: `preconnect`, href: `https://fonts.gstatic.com`, crossorigin: ``}),
        E.link.props({rel: `preconnect`, href: `https://fonts.googleapis.com`}),
        E.link.props({rel: `preconnect`, href: `https://fonts.gstatic.com`, crossorigin: ``}),
        E.link.props({rel: `stylesheet`, href: `https://fonts.googleapis.com/css2?family=Bitter:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&display=swap`}),
        a.vac(DEV) && E.script.chi(`navigator.serviceWorker.register('/sw.mjs')`),
      ),
      E.body.props({class: `center limit`}).chi(chi),
      E.script.props({type: `module`, src: `/browser.mjs`}),
      E.script.props({type: `module`, src: `/site.mjs`}),
      a.vac(DEV) && E.script.props({type: `module`, src: l.LIVE_CLIENT}),
    )
  )
}

function Nav(page) {
  return E.nav.props({class: `gap-hor`}).chi(
    a.map(page.site.nav, PageLink),
  )
}

function Footer(page) {
  return E.footer.chi(
    E.p.chi(`Любое использование либо копирование материалов или подборки материалов сайта, 
      элементов дизайна и оформления допускается только cо ссылкой на источник 
      https://diatom.github.io/ и указанием авторства`),
    E.div.chi(
      Contact(contact)
    ),
    Nav(page),
    E.span.chi(E.a.props({href: `https://github.com/Diatom/diatom.github.io`}).
    chi(`© 2024. Сайт сделал Severin B. 👾`)
    )
  )
}

function FooterIbri(page) {
  return E.footer.chi(
    E.img.props({alt: `Ibri`, src: `/images/Ibri-logo.png`}),
    E.p.chi(`Ibri® — все права защищены. Любое использование либо копирование материалов сайта, 
      допускается только cо ссылкой на источник`),
    E.div.chi(
      Contact(contactIbri)
    ),
    E.span.chi(E.a.props({href: `https://github.com/Diatom/diatom.github.io`}).
    chi(`© 2024. Сайт сделал Severin B. 👾`)
    )
  )
}

function PageLink(page) {
  a.reqInst(page, Page)
  return E.a.props({href: page.urlPath()}).chi(page.title())
}

function Contact(cont) {
  return cont.map((val) => {
    for (let [key, value] of Object.entries(val)) {
      return E.a.props({href: value}).chi(key);
    }
  })
}
// console.log(site.all())
