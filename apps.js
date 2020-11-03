// load express
const express = require('express')

// SQL
const SQL_GET_TVSHOW_BY_NAME = 'select tvid, name from leisure.tv_shows order by name desc limit ?;';
const SQL_GET_TVSHOW_BY_TVID = 'select * from leisure.tv_shows where tvid = ?'

module.exports = function(p) {

    const router = express.Router()
    const pool = p

    router.get('/', async (req, resp) => {

        const conn = await pool.getConnection()

        try {
            const results = await conn.query(SQL_GET_TVSHOW_BY_NAME, [100])

            resp.status(200)
            resp.type('text/html')
            resp.render('index', { shows: results[0] })

        } catch(e) {
            resp.status(500)
            resp.type('text/html')
            resp.send(JSON.stringify(e))
        } finally {
            conn.release()
        }

    })

    router.get('/show/:tvId', async (req, resp) => {
        const tvId = req.params['tvId']

        const conn = await pool.getConnection()

        try {
            const results = await conn.query(SQL_GET_TVSHOW_BY_TVID, [ tvId ])
            const recs = results[0]
            //console.log(recs)

            if (recs.length <= 0) {
                //404!
                resp.status(404)
                resp.type('text/html')
                resp.send(`Not found: ${tvId}`)
                return
            }

            resp.status(200)
            resp.format({
                'text/html': () => {
                    resp.type('text/html')
                    resp.render('detailview', { tvshow: recs[0] })
                },
                'application/json': () => {
                    resp.type('application/json')
                    resp.json(recs[0])
                },
                'default': () => {
                    resp.type('text/plain')
                    resp.send(JSON.stringify(recs[0]))
                }
            })

        } catch(e) {
            resp.status(500)
            resp.type('text/html')
            resp.send(JSON.stringify(e))
        } finally {
            conn.release()
        }
    })

    router.get('/category', async (req, resp) => {

        const conn = await pool.getConnection()

        try {
            const results = await conn.query(SQL_GET_APP_CATEGORIES)
            const cats = results[0].map(v => v.category)

            resp.status(200)
            resp.type('text/html')
            resp.render('index', { category: cats })

        } catch(e) {
            resp.status(500)
            resp.type('text/html')
            resp.send(JSON.stringify(e))
        } finally {
            conn.release()
        }
    })

    return (router)
}
