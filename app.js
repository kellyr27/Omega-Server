const express = require('express');
const app = express();
const morgan = require('morgan');

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(morgan('tiny'));


if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

