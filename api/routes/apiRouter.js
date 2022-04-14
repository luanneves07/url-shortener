const express = require('express');
const apiRouter = express.Router();
const statusCode = require('http-status-codes')

const endpoint = '/';
const version = 'v0';

/**
 * Application
 */
apiRouter.get(endpoint + ':shortenedUrl', (req, res) => {
    const shortenedUrl = 'https://www.google.com.br';
    console.log(shortenedUrl);
    res.redirect(statusCode.StatusCodes.MOVED_PERMANENTLY, shortenedUrl);
});

apiRouter.post(endpoint + version + '/shorten', (req, res) => {
    res.status(statusCode.StatusCodes.OK).json();
})

module.exports = apiRouter;