const mongoose = require('mongoose');

const connectMongoDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017", {
            useUnifiedTopology: true,
            useNewUrlParser: true
        });
    } catch (err) {
        console.error(err);
    }
}

module.exports = connectDB
