const express = require('express');
const apiRouter = express.Router();
const path = require('path');
const statusCode = require('http-status-codes');

const { request } = require('undici');
const amqp = require('../../services/mqservices');
amqp.connect(() => {
    console.log("Connection with Rabbitmq was successful");
});

const generatorEndpoint = process.env.URL_GENERATOR_ENDPOINT;
const endpoint = '/';
const version = 'v0';
const database = require('../../db/database');

/**
 * Presenter
 */
apiRouter.get('/', (req, res) => {
    res.sendFile(path.resolve('public/index.html'));
});

/**
 * Application
 */
apiRouter.get(`${endpoint}:shortenedUrl`, (req, res) => {
    const { shortenedUrl } = req.params;
    database.findByShortenedUrl(shortenedUrl)
        .then(urls => {
            if (urls.length) {
                res.redirect(statusCode.StatusCodes.MOVED_PERMANENTLY, urls[0].original_url);
            } else {
                res.status(statusCode.StatusCodes.NOT_FOUND).json({ message: 'URL not found' });
            }
        })
        .catch(err => {
            res.status(statusCode.StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: `Error finding the URL ${shortenedUrl} - ${err.message}`
            });
        });
});

apiRouter.post(`${endpoint}api/${version}/shorten`, async (req, res) => {
    if (req.body) {
        const { original_url } = req.body;
        const { body } = await request(generatorEndpoint);
        const shortenedUrl = await body.json();
        const shortenerUniqueID = shortenedUrl.shortened_url;
        if (shortenerUniqueID !== '-1') {
            const shortenedData = {
                original_url: original_url,
                shortened_url: shortenerUniqueID
            }
            // await amqp.publishToQueue('db-insert-queue', JSON.stringify(shortenedData));
            res.status(statusCode.StatusCodes.OK).json(shortenedData);
        } else {
            res.status(statusCode.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error generating a new URL. Try again later." });
        }

    } else {
        res.send({ message: "empty body" });
    }
});

apiRouter.get(`${endpoint}api/${version}/urls`, async (req, res) => {
    database.findAll()
        .then(urls => { res.status(statusCode.StatusCodes.OK).json(urls); })
        .catch(err => {
            res.status(500).json({
                message: `Error finding all the URLs - ${err.message}`
            });
        });
});

module.exports = apiRouter;