const knex = require('knex')({
    client: 'pg',
    debug: false,
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    }
});

module.exports = {
    findAll: () => knex.select('*').from('urls'),
    findAllShortenedUrls: () => knex.select('shortened_url').from('urls'),
    findByShortenedUrl: (shortenedUrl) => knex.select('original_url').from('urls').where('shortened_url', '=', shortenedUrl),
}