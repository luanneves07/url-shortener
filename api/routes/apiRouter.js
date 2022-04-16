const express = require('express');
const apiRouter = express.Router();
const path = require('path');
const statusCode = require('http-status-codes');

const amqp = require('../../services/mqservices');
amqp.connect(() => {
    console.log("Connection with Rabbitmq was successful");
});

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
        const shortenedData = {
            original_url: original_url,
        }
        await amqp.publishToQueue('db-insert-queue', JSON.stringify(shortenedData));
        res.status(statusCode.StatusCodes.OK).json(shortenedData);
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