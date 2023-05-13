const express  = require('express');

const app = express();

const PORT = 4000 || 5000;


app.get('/', (req, res) => {
    res.send('API  funcional!');
});

app.listen(PORT ,() => {
    console.log(`listening on port ${PORT}`);
});

