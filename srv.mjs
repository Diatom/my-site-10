import * as a from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.25/all.mjs'
import * as hd from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.25/http_deno.mjs'
import * as ld from 'https://cdn.jsdelivr.net/npm/@mitranim/js@0.1.25/live_deno.mjs'
import * as l from './live.mjs'
import * as s from './site.mjs'
// console.log(s.site.all())

export const dirs = ld.LiveDirs.of(
  hd.dirRel(`target`),
  hd.dirRel(`static`),
  hd.dirRel(`.`),
)

const srv = new class Srv extends hd.Srv {
  errRes(err) {
    return new Response(err.stack, {status: 500})
  }
  async res(req) {
    const rou = new a.ReqRou(req)
    // console.log(req)
    return (
      (await dirs.resolveFile(rou.url))?.res() ||
      a.procure(s.site.all(), page => (
        rou.get(page.urlPath()) && page.res(rou)
      )) ||
      s.site.notFound.res(rou)
    )
  }
}()

async function main() {
  liveReload()
  await srv.listen({port: 36583, hostname: `localhost`})
}

/*
Tells each connected "live client" to reload the page.
Requires `make live`, which is invoked by default by `make`.
*/
function liveReload() {
  fetch(l.LIVE_SEND, {method: `post`, body: `{"type":"change"}`}).catch(a.nop)
}

if (import.meta.main) await main()