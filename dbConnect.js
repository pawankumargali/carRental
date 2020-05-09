const mongoose = require('mongoose');

function dbConnect() {
    const connectionOptions = { 
                                useUnifiedTopology:true, 
                                useNewUrlParser:true, 
                                useCreateIndex:true,
                                useFindAndModify:false
                              };
    mongoose.connect(process.env.DB_URL, connectionOptions)
                .then(() => console.log('Connected to DB...'))
                .catch(err => console.log(`DB Connection Error: ${err}`));
}

module.exports = dbConnect;