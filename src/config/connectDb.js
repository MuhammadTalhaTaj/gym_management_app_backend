// config/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Reduce timeout to 5s for faster feedback
    });
    console.log('✅ MongoDB connected to GymOps database');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); // Exit if DB connection fails
  }
};

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to GymOps');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

export { connectDB };