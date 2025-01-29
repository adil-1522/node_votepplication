const express = require('express')
const app = express();
require('dotenv').config();
const db = require('./db');



const bodyParser = require('body-parser');
app.use(bodyParser.json()); 





const PORT = process.env.PORT || 3000;
app.listen(PORT ,()=>{
    console.log('listening on port 3000')
})

const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');


app.use('/user',userRoutes);
app.use('/candidate',candidateRoutes);