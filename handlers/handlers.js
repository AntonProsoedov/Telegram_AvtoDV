import connectDB from '../database/connection.js'
import Car from '../database/carSchema.js';
import getEmoji from '../scripts/emoji.js';
import path from 'path';
import fs from 'fs';

connectDB();

const imagesDir = path.resolve('sources/img');

class Handlers {
  async allBrands () {
    try {
      const brands = await Car.aggregate([
        {
          $group: {
            _id: '$brand',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            id: '$_id',
            count: 1,
          }
        },
        {
          $sort: { count: -1 }
        }
      ])
      return brands;
    } catch (error) {
      console.log('Ошибка обработчика allBrands ' + error)
    } 
  }

  async getByBrand(carBrand) {
    try {
      const cars = await Car.find({brand: carBrand});
      return cars;
    } catch (error) {
      console.log('Ошибка обработчика getByBrand ' + error)
    } 
  }

  async getModels(carBrand) {
    try {
      const models = await Car.aggregate([
        {
          $match: {
            brand: carBrand
          }
        },
        {
          $group: {
            _id: '$model',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            id: '$_id',
            count: 1,
          }
        },
        {
          $sort: { count: -1 }
        }
      ])
      return models;
    } catch (error) {
      console.log('Ошибка обработчика getModels ' + error)
    } 
  }


  async getByModel(carModel) {
    try {
      const cars = await Car.find({model: carModel});
      return cars;
    } catch (error) {
      console.log('Ошибка обработчика getByModel ' + error)
    } 
  }

  async years () {
    try {
      const years = await Car.aggregate([
        {
          $group: {
            _id: '$yearOfManufacture',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            id: '$_id',
            count: 1,
          }
        },
        {
          $sort: { _id: -1 }
        }
      ])
      return years;
    } catch (error) {
      console.log('Ошибка обработчика years ' + error)
    } 
  }

  async getByYear(carYear) {
    try {
      const cars = await Car.find({yearOfManufacture: Number(carYear)});
      return cars;
    } catch (error) {
      console.log('Ошибка обработчика getByYear ' + error)
    } 
  }

  async allMileage () {
    try {
      const milage = await Car.aggregate([
        {
          $bucket: {
            groupBy: "$carMileage",
            boundaries: [0, 50, 100, 150, 201],
            default: "noData",
            output: {
              count: { $sum: 1 },
            }
          }
        },
        {
          $project: {
            id: {
              $switch: {
                branches: [
                  { case: { $eq: ["$_id", 0] }, then: "0-49 тыс.км" },
                  { case: { $eq: ["$_id", 50] }, then: "50-99 тыс.км" },
                  { case: { $eq: ["$_id", 100] }, then: "100-149 тыс.км" },
                  { case: { $eq: ["$_id", 150] }, then: "150-200 тыс.км" },
                  { case: { $eq: ["$_id", "noData"] }, then: 'noData' }
                ],
                default: "Неизвестный диапазон"
              }
            },
            count: 1,
          }
        },
        { $sort: { _id: 1 } }
      ])
      return milage;
    } catch (error) {
      console.log('Ошибка обработчика allMilag ' + error)
    } 
  }

  async getByMilage(mileage) {
    try {
      const cars = await Car.find({carMileage: {$gte: Number(mileage), $lte: Number(mileage) + 49}});
      return cars;
    } catch (error) {
      console.log('Ошибка обработчика getByYear ' + error)
    } 
  }

  createPosts(cars) {
    try {
      const posts = [];
      for (const car of cars) {
        const carImages = path.resolve(imagesDir, `${car.id}`);
        const post = [];
        const images = fs.readdirSync(carImages)
        for (let i = 0; (i < 10 && i < (images.length || 1)); i++) { 
          if (i == 0) {
            post.push({
              type: 'photo',
              media: images.length ? path.join(carImages, images[i]) : 'sources/img/default.jpg',
              caption: `${getEmoji(car.country)}${car.brand} ${car.model}${getEmoji(car.country)}\n\n${car.equipment? '👉Комплектация ' + car.equipment + '\n': ''}👉${car.yearOfManufacture} год выпуска\n${car.carMileage? '👉Пробег ' + car.carMileage + ' тыс. км\n': ''}${car.auctionValuation? '👉Аукционная оценка ' + car.auctionValuation + ' балла\n': ''}${car.finalPrice? '👉' + car.finalPrice + ' т.р.\n': ''}\n`
            });
          } else {
            post.push({
              type: 'photo',
              media: path.join(carImages, images[i]),
            });
          }
        }
        posts.push(post);
      }
      return posts
    } catch (error) {
      console.log('Ошибка при создании постов ' + error)
    }
  }
 
  async _addCar(car) {
    try {
      const createdCar = await Car.create(car);
      const carImages = path.resolve(imagesDir, `${createdCar.id}`);
      fs.mkdirSync(carImages);
    } catch (error) {
      console.log('Ошибка при добавлении авто ' + error)
    }
  }
//Для статистики
  async countAll() {
    try {
      const cars = await Car.estimatedDocumentCount();
      console.log(cars + ' всего')
      return cars;
    } catch (error) {
      console.log('Ошибка обработчика countAll ' + error)
    } 
  }
  async getTopBrands () {
    try {
      const models = await Car.aggregate([
        {
          $group: {
            _id: '$brand',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        { $limit: 3 }
      ])
      return models;
    } catch (error) {
      console.log('Ошибка обработчика getTopBrands ' + error)
    } 
  }
  async getTopModels () {
    try {
      const models = await Car.aggregate([
        {
          $group: {
            _id: {
              brand: '$brand',
              model: '$model'
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        { $limit: 3 }
      ])
      return models;
    } catch (error) {
      console.log('Ошибка обработчика getTopModels ' + error)
    } 
  }
  ///Средние показатели
  async getAverageMileage () {
    try {
      const avg = await Car.aggregate([
        {
          $group: {
            _id: null,
            average: { $avg: "$carMileage" }
          }
        }
      ])
      return avg
    } catch (error) {
      console.log('Ошибка обработчика getAverageMileage ' + error)
    } 
  }
  async getAveragePrice () {
    try {
      const avg = await Car.aggregate([
        {
          $group: {
            _id: null,
            average: { $avg: "$finalPrice" }
          }
        }
      ])
      return avg
    } catch (error) {
      console.log('Ошибка обработчика getAveragePrice ' + error)
    } 
  }
  
}


export default new Handlers();