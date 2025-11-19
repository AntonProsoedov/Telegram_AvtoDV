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
  bmw: 'BMW',
  volvo: 'Volvo',
  mitsubishi: 'Mitsubishi',
  audi: 'Audi',
  kia: 'Kia',
  geely: 'Geely',
  suzuki: 'Suzuki',
  mini: 'MINI',
  ssangyong: 'SsangYong',
  hyundai: 'Hyundai',
  bestune: 'Bestune'
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

    if (msg.data == 'lastPage') {
      await bot.editMessageReplyMarkup(
        { inline_keyboard: [] },
        {
          chat_id: msg.message.chat.id,
          message_id: msg.message.message_id
        }
      );
      const posts = handlers.createPosts(pages.lastPage(cars));
      for(const post of posts) {
        await bot.sendMediaGroup(msg.message.chat.id, post);
      }
      await bot.sendMessage(msg.message.chat.id, pages.getArticleForMenu(), menu.pages(pages.getCurrentPage()))
    }

    if (msg.data == 'firstPage') {
      await bot.editMessageReplyMarkup(
        { inline_keyboard: [] },
        {
          chat_id: msg.message.chat.id,
          message_id: msg.message.message_id
        }
      );
      const posts = handlers.createPosts(pages.firstPage(cars));
      for(const post of posts) {
        await bot.sendMediaGroup(msg.message.chat.id, post);
      }
      await bot.sendMessage(msg.message.chat.id, pages.getArticleForMenu(), menu.pages(pages.getCurrentPage()))
    } 

    else if (filterCallbacksData.includes(msg.data)) {
      await bot.editMessageReplyMarkup(
        { inline_keyboard: [] },
        {
          chat_id: msg.message.chat.id,
          message_id: msg.message.message_id
        }
      );
      cars = await filterCallback(msg.data);
      pages = new Slider(cars.length);

      await bot.sendMessage(msg.message.chat.id, `Всего найдено ${cars.length} авто`)
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
      const models = await handlers.getModels(msg.data)
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
  if(msg.text == '/start') {
    await bot.sendMessage(msg.chat.id, `Здравствуйте, ${msg.from.first_name}👋`)
  }
  if(msg.text == '/menu' || msg.text == 'Главное меню') {
    await bot.sendMessage(msg.chat.id, 'Главное меню', menu.getMainMenu(msg.chat.id))
  }

  else if(msg.text == 'Контакты ☎️') {
    await bot.sendMessage(msg.chat.id, menu.getContactMenu())
  }

  else if(msg.text == 'О процессе покупки') {
    await bot.sendMessage(msg.chat.id, menu.getAboutMenu())
  }

  else if(msg.text == '❌ Закрыть меню') {
    await bot.sendMessage(msg.chat.id, 'Меню закрыто', menu.closeMenu())
  }

  else if(msg.text == 'Купленные автомобили 🚘') {
    await bot.sendMessage(msg.chat.id, 'Купленные автомобили 🚘', menu.getArchiveMenu())
  }

  else if(msg.text == 'Статистика') {
    const allCars = await handlers.countAll();
    const topBrands = await handlers.getTopBrands();
    const topModels = await handlers.getTopModels();
    const avgMileage = await handlers.getAverageMileage()
    const avgPrice = await handlers.getAveragePrice()

    await bot.sendMessage(msg.chat.id, menu.getStatistics(allCars, topBrands, topModels, avgMileage, avgPrice))
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
      brand: brand.audi,
      model: 'Q3',
      equipment: '1.5 35 TFSI',
      yearOfManufacture: 2020,
      carMileage: 61,
      auctionValuation: '4.5',
      finalPrice: 1790,
      customerСity: 'город Иркутск',
      buyDate: new Date('2025-11-18')
    };
//Последний добавленный авто 18 ноября
    // await handlers._addCar(newCar)
    // await bot.sendMessage(msg.chat.id, `Автомобиль ${newCar.brand} ${newCar.model} добален`)
    // console.log(`Добавлен ${newCar.brand} ${newCar.model}`)
  }
});

