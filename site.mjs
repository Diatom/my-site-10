/* global Deno */

import * as a from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.25/all.mjs'
import * as hd from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.25/http_deno.mjs'
import * as ld from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.25/live_deno.mjs'
import * as p from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.25/prax.mjs'
import * as dg from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.25/dom_glob_shim.mjs'
import {paths as pt} from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.25/io_deno.mjs'
import * as l from './live.mjs'

import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js'

// const fetP = await fetch (`./data/principe.md`)
// const principe = await fetP.text()
// const marked = require('marked');
// const fs = require('fs');
// const principe = fs.readFileSync('./data/principe.md', 'utf8')

const {E} = new p.Ren(dg.document).patchProto(dg.glob.Element)

const DEV = Deno.args.includes(`--dev`)

export const dirs = ld.LiveDirs.of(
  hd.dirRel(`target`),
  hd.dirRel(`static`),
)

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
    return path && pt.join(`target`, path)
  }

  title() {return ``}

  res() {return a.resBui().html(this.body()).res()}

  body() {return ``}

  async write() {
    const path = this.targetPath()
    if (!path) return

    const body = this.body()
    if (!body) return

    await Deno.mkdir(pt.dir(path), {recursive: true})
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
      Nav(this),
      E.h1.chi(this.title()),
      E.a.props({href: `/`}).chi(`Return home`),
    )
  }
}

// Main //
class PageIndex extends Page {
  urlPath() {return `/`}
  fsPath() {return `index.html`}
  title() {return `Главная`}

  body() {
    return Layout(
      Nav(this),
      E.h1.chi(this.title()),
      E.p.chi(`This text was pre-rendered in HTML.`),
      Main(this).chi(
        E.aboutme.chi(E.h1.chi(`Северин Богучарский`)),
        E.lastart,
        // E.principe.chi(marked(principe))
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
      Nav(this),
      E.h1.chi(this.title()),
      E.p.chi(`This text was pre-rendered in HTML.`),
    )
  }
}

// Bookreview //
class PageBookreview extends Page {
  urlPath() {return `/bookreview`}
  title() {return `Обзоры книг`}

  body() {
    return Layout(
      Nav(this),
      E.h1.chi(this.title()),
      E.p.chi(`This text was pre-rendered in HTML.`),
    )
  }
}

// Cheese //
class PageCheese extends Page {
  urlPath() {return `/cheese`}
  title() {return `Сыр`}

  body() {
    return Layout(
      Nav(this),
      E.h1.chi(this.title()),
      E.p.chi(`This text was pre-rendered in HTML.`),
    )
  }
}

// Ibri //
class PageIbri extends Page {
  urlPath() {return `/ibri`}
  title() {return `Ibri®`}

  body() {
    return Layout(
      Nav(this),
      E.h1.chi(this.title()),
      E.p.chi(`This text was pre-rendered in HTML.`),
    )
  }
}

class Site extends a.Emp {
  constructor() {
    super()
    this.notFound = new Page404(this)
    this.other = [new PageIndex(this), new PageBlog(this), new PageBookreview(this), new PageCheese(this), new PageIbri(this)]
  }

  all() {return [this.notFound, ...this.other]}
}

export const site = new Site()

function Layout(...chi) {
  return p.renderDocument(
    E.html.chi(
      E.head.chi(
        E.meta.props({charset: `utf-8`}),
        E.meta.props({name: `viewport`, content: `width=device-width, initial-scale=1`}),
        E.title.chi(`Северин Богучарский`),
        E.link.props({rel: `icon`, type: `image/x-icon`, href: `./images/severin.ico`}),
        E.link.props({rel: `stylesheet`, href: `/main.css`}),
        a.vac(DEV) && E.script.chi(`navigator.serviceWorker.register('/sw.mjs')`),
      ),
      E.body.props({class: `center limit`}).chi(chi),
      E.script.props({type: `module`, src: `/browser.mjs`}),
      a.vac(DEV) && E.script.props({type: `module`, src: l.LIVE_CLIENT}),
    )
  )
}

function Nav(page) {
  return E.nav.props({class: `gap-hor`}).chi(
    a.map(page.site.all(), PageLink),
  )
}

function Main(page) {
  return E.main
}

function Footer(page) {
  return E.footer.chi(
    E.div.chi(`Любое использование либо копирование материалов или подборки материалов сайта, 
      элементов дизайна и оформления допускается только cо ссылкой на источник 
      https://diatom.github.io/ и указанием авторства`),
    // a.map(page.site.all(), PageLink),
    E.span.chi(E.a.props({href: `https://github.com/Diatom/diatom.github.io`}).
    chi(`© 2024. Сайт сделал Severin B. 👾`)
    )
  )
}

function PageLink(page) {
  a.reqInst(page, Page)
  return E.a.props({href: page.urlPath()}).chi(page.title())
}
