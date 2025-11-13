import mongoose from 'mongoose';

const { Schema } = mongoose;

const carSchema = new Schema({
  country: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 20
  },
  brand: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 50
  },
  model: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 50
  },
  equipment: {
    type: String,
    minLength: 1,
    maxLength: 50
  },
  yearOfManufacture: {
    type: Number,
    required: true, 
    min: 2000,
    max: 2100
  },
  carMileage: {
    type: Number,
    min: 0,
    max: 999
  },
  auctionValuation: {
    type: String
  },
  finalPrice: {
    type: Number,
  },
  customerСity: {
    type: String,
  }
});

export default mongoose.model('Car', carSchema)