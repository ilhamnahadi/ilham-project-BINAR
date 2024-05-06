const express = require('express')
const PORT = 1407;

const app = express();
app.use(express.urlencoded());

const indexRouter = require('./routes/routesAdvance');

// CONTROLLER
app.use('/api', indexRouter);

app.get('/', (req, res) => {
    res.status(200).send("Welcome to ILHAM WEBSITE !");
});
app.get('*', (req, res) => {
    res.status(404).send("Try Again !");
});

app.listen(PORT, (req, res) =>{
    console.log(`app berjalan di localhost ${PORT}`)
});