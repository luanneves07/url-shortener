require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const bodyParser = require('body-parser');

const apiRouter = require('./api/routes/apiRouter');

/**
 * Environment
 */
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRouter);
app.get('/', (req, res) => {
    res.sendFile('public/index.html', { root: __dirname });
});

app.listen(port, () => {
    console.log(`Server started at port ${port}/`);
});