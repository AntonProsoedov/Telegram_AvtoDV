import mongoose from 'mongoose';
import dotenv from 'dotenv'

dotenv.config()
const connectionOptions = {
  //  useNewUrlParser: true,
  //   useUnifiedTopology: true,
  //   maxPoolSize: 10,                    // Максимальное количество соединений в пуле
  //   serverSelectionTimeoutMS: 5000,     // Таймаут выбора сервера
  //   socketTimeoutMS: 45000,             // Таймаут сокета
  //   family: 4,                          // Использовать IPv4
}
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL), connectionOptions;
    console.log('✅ Успешно подключено к Mongo Atlas');

  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

export default connectDB;