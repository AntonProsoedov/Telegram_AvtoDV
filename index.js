import TelegramBot from 'node-telegram-bot-api';
import handlers from './handlers/handlers.js';
import menu from './handlers/menu.js'
import Slider from './handlers/slider.js';
import dotenv from 'dotenv'

dotenv.config()

///Временно для добавления авто
const brand = {
  toyota: 'Toyota',
  honda: 'Honda',
  subaru: 'Subaru',
  nissan: 'Nissan',
  volkswagen: 'Volkswagen',
  mazda: 'Mazda',
  mercedes: 'Mercedes-Benz',
  bmv: 'BMW',
  volvo: 'Volvo',
  mitsubishi: 'Mitsubishi',
  audi: 'Audi',
  kia: 'Kia',
  geely: 'Geely',
  suzuki: 'Suzuki',
  mini: 'MINI',
  ssangyong: 'SsangYong',
  hyundai: 'Hyundai'
}

let cars;
let pages;
let filterCallback;
let filterCallbacksData = [];
let carBrands = [];


const bot = new TelegramBot(process.env.API_KEY_BOT, {
  polling: {
    interval: 300,
    params: {
      timeout: 10
    },
    autoStart: true
  }
});


bot.on("polling_error", err => console.log(err.message));

bot.on('callback_query', async msg => {
  try {
    if (msg.data == 'nextPage') {
      await bot.editMessageReplyMarkup(
        { inline_keyboard: [] },
        {
          chat_id: msg.message.chat.id,
          message_id: msg.message.message_id
        }
      );
      const posts = handlers.createPosts(pages.nextPage(cars));
      for(const post of posts) {
        await bot.sendMediaGroup(msg.message.chat.id, post);
      }
      await bot.sendMessage(msg.message.chat.id, pages.getArticleForMenu(), menu.pages(pages.getCurrentPage()))
    } 

    else if (msg.data == 'prevPage') {
      await bot.editMessageReplyMarkup(
        { inline_keyboard: [] },
        {
          chat_id: msg.message.chat.id,
          message_id: msg.message.message_id
        }
      );
      const posts = handlers.createPosts(pages.prevPage(cars));
      for(const post of posts) {
        await bot.sendMediaGroup(msg.message.chat.id, post);
      }
      await bot.sendMessage(msg.message.chat.id, pages.getArticleForMenu(), menu.pages(pages.getCurrentPage()))
    } 

    else if (msg.data == 'archiveMenu') {
      await bot.editMessageReplyMarkup(
        { inline_keyboard: [] },
        {
          chat_id: msg.message.chat.id,
          message_id: msg.message.message_id
        }
      );
      await bot.sendMessage(msg.message.chat.id, 'Архив купленных авто 🚘', menu.getArchiveMenu())
    }
     
    else if (filterCallbacksData.includes(msg.data)) {
      await bot.editMessageReplyMarkup(
        { inline_keyboard: [] },
        {
          chat_id: msg.message.chat.id,
          message_id: msg.message.message_id
        }
      );
      await bot.deleteMessage(msg.message.chat.id, msg.message.message_id)
      // console.log('Поиск по фильтру ' + msg.data);
      cars = await filterCallback(msg.data);
      pages = new Slider(cars.length);

      await bot.sendMessage(msg.message.chat.id, `Всего найдено ${cars.length} авто`, menu.closeMenu())
      const posts = handlers.createPosts(pages.firstPage(cars));
      for (const post of posts) {
        await bot.sendMediaGroup(msg.message.chat.id, post);
      }
      await bot.sendMessage(msg.message.chat.id, pages.getArticleForMenu(), menu.pages(pages.getCurrentPage()))
    }

    else if (carBrands.includes(msg.data)) {
      await bot.editMessageReplyMarkup(
        { inline_keyboard: [] },
        {
          chat_id: msg.message.chat.id,
          message_id: msg.message.message_id
        }
      );
      await bot.deleteMessage(msg.message.chat.id, msg.message.message_id)
      // console.log('Поиск по фильтру ' + msg.data);
      const models = await handlers.getModels(msg.data)
      // console.log(models)
      await bot.sendMessage(msg.message.chat.id, `Модели ${msg.data}:`, menu.filterMenu(models))
      const callbacksData = []
      for (const {id} of models) {
        callbacksData.push(id)
      }
      filterCallbacksData = callbacksData;
      filterCallback = handlers.getByModel;
    }
  } catch (error) {
    console.log('Ошибка в callback_query: ' + error)
  }
});

bot.on('text', async msg => {
  await bot.deleteMessage(msg.chat.id, msg.message_id); //Удалять введенный текст
  if(msg.text == '/menu' || msg.text == 'Главное меню' || '/start') {
    await bot.sendMessage(msg.chat.id, 'Главное меню', menu.getMainMenu(msg.chat.id))
  }

  else if(msg.text == 'Контакты') {
    await bot.sendMessage(msg.chat.id, menu.getContactMenu())
  }

  else if(msg.text == 'О процессе покупки') {
    await bot.sendMessage(msg.chat.id, menu.getAboutMenu())
  }

  else if(msg.text == '❌ Закрыть меню') {
    await bot.sendMessage(msg.chat.id, 'Меню закрыто', menu.closeMenu())
  }

  else if(msg.text == 'Архив купленных авто 🚘') {
    await bot.sendMessage(msg.chat.id, 'Архив купленных авто 🚘', menu.getArchiveMenu())
  }

  // else if(msg.text == 'Все автомобили') {
  //   try {
  //     cars = await handlers.getAll();
  //     pages = new Slider(cars.length);
  //     // console.log('Всего автомобилей: ' + cars.length);
  //     // console.log('Последний: ' + cars[cars.length - 1].brand + ' ' + cars[cars.length - 1].model);
  //     await bot.sendMessage(msg.chat.id, `Всего ${cars.length} авто`, menu.closeMenu())
  //     const posts = handlers.createPosts(pages.firstPage(cars));
  //     for (const post of posts) {
  //       await bot.sendMediaGroup(msg.chat.id, post);
  //     }
  //     await bot.sendMessage(msg.chat.id, pages.getArticleForMenu(), menu.pages(pages.getCurrentPage()))
  //   } catch (error) {
  //     console.log('Все автомобили: ' + error)
  //   }
  // }
  else if(msg.text == 'Статистика') {
    const allCars = await handlers.countAll();
    const topBrands = await handlers.getTopBrands();
    const topModels = await handlers.getTopModels();
    const avgMileage = await handlers.getAverageMileage()
    const avgPrice = await handlers.getAveragePrice()

    await bot.sendMessage(msg.chat.id, menu.getStatistics(allCars, topBrands, topModels, avgMileage, avgPrice))

    // console.log(allCars)
    // console.log(topBrands)
    // console.log(topModels)
    // console.log(avgMileage)
    // console.log(avgPrice)
  }

  else if(msg.text == 'По марке') {
    const brands = await handlers.allBrands()
    // console.log(brands)
    const callbacksData = []
    for (const {_id} of brands) {
      callbacksData.push(_id)
    }
    carBrands = callbacksData;
    await bot.sendMessage(msg.chat.id, 'Марки авто:', menu.filterMenu(brands))
    // console.log(carBrands)
  }

  else if(msg.text == 'По году выпуска') {
    const years = await handlers.years()
    await bot.sendMessage(msg.chat.id, 'Годы выпуска:', menu.filterMenu(years))
    const callbacksData = []
    for (const {_id} of years) {
      callbacksData.push(_id.toString())
    }
    filterCallbacksData = callbacksData;
    filterCallback = handlers.getByYear;
  }

  else if(msg.text == 'По пробегу') {
    const milage = await handlers.allMileage();
    await bot.sendMessage(msg.chat.id, 'Пробег авто:', menu.filterMenu(milage));
    await bot.sendMessage(msg.chat.id, `Нет данных по пробегу - ${milage[milage.length-1].count} авто`);
    const callbacksData = [];
    for (const {_id} of milage) {
      callbacksData.push(_id.toString())
    }
    filterCallbacksData = callbacksData;
    filterCallback = handlers.getByMilage;
  }

  else if(msg.text == 'Добавить авто') {
    const newCar = {
      country: 'Japan', // China   Korea   Japan
      brand: brand.mercedes,
      model: 'C-Class',
      equipment: 'C180 COUPE SPORT',
      yearOfManufacture: 2016,
      carMileage: 29,
      auctionValuation: '4.0',
      finalPrice: 1700,
      customerСity: 'поселок Белореченский'
    };
//Последний добавленный авто 15 октября
    // await handlers._addCar(newCar)
    // await bot.sendMessage(msg.chat.id, `Автомобиль ${newCar.brand} ${newCar.model} добален`)
    // console.log(`Добавлен ${newCar.brand} ${newCar.model}`)
  }
});

