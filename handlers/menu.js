class Menu {
  getMainMenu(id) {
    let menu;
    if (id == '407551033') {
      menu = [
        ['Архив купленных авто 🚘'],
        ['Добавить авто'],
        ['О процессе покупки', 'Контакты'],
        ['❌ Закрыть меню']
      ]
    } else {
      menu = [
        ['Архив купленных авто 🚘'],
        ['О процессе покупки', 'Контакты'],
        ['❌ Закрыть меню']
      ]
    }
    return {
      reply_markup: {
        keyboard: menu,
        resize_keyboard: true
      }
    }
  }

  closeMenu() {
    return {
      reply_markup: {
        remove_keyboard: true
      }
    }
  }

  pages([currentPage, pages]) {
    if (pages < 2) {
      return {
        reply_markup: {
          inline_keyboard: [
            [{text: ' Вернуться в архив ', callback_data: 'archiveMenu'}]
          ]
        }
      }
    } else if (currentPage == 1) {
      return {
        reply_markup: {
          inline_keyboard: [
            [{text: ' вперед 👉 ', callback_data: 'nextPage'}],
            [{text: ' Вернуться в архив ', callback_data: 'archiveMenu'}]
          ]
        }
      }
    } else if (currentPage == pages) {
      return {
        reply_markup: {
          inline_keyboard: [
            [{text: ' 👈 назад', callback_data: 'prevPage'}],
            [{text: ' Вернуться в архив ', callback_data: 'archiveMenu'}]
          ]
        }
      }
    } else {
      return {
        reply_markup: {
          inline_keyboard: [
            [{text: ' 👈 назад', callback_data: 'prevPage'}, {text: 'вперед 👉 ', callback_data: 'nextPage'}],
            [{text: ' Вернуться в архив ', callback_data: 'archiveMenu'}]
          ]
        }
      }
    }
  }

  filterMenu(items) {
    const keyboard = [];
    for (let i = 0; i < items.length; i += 2) {
      const row = [];
      items.slice(i, i + 2).forEach( ({id, _id, count}) => {
        if (id !== 'noData') {
          row.push({text: `${id} - ${count}`, callback_data: _id})
        }
      });
      keyboard.push(row)
    }
    return {
      reply_markup: {
        inline_keyboard: keyboard
      }
    }
  }
  getArchiveMenu() {
    return {
      reply_markup: {
        keyboard: [
          ['По марке', 'По году выпуска'],
          ['По пробегу', 'Статистика'],
          ['Главное меню']
        ],
        resize_keyboard: true
      }
    }
  }
  getContactMenu() {
    return `🔴Если вы желаете купить автомобиль, пишите или звоните!\n\n📲 +79086528872\n📲 +79501115647\n📲 +79500661986\n\nНаш канал с новостями:\nt.me/avt0_dv`
  }
  getAboutMenu() {
    return `🔴Из чего стостоит процесс покупки автомобиля на аукционе:\n🔺1. То то и то то\n🔺2. Что-нибудь второе\n🔺3. Третий этап\n\n🔴Доставка автомобиля из Владивостока:\nМы можем доставить автомобиль в любой город. Стоимость доставки зависит от удаленности.\n\n🔴Что-нибуди еще из процесса покупки`
  }
  getStatistics(allCars, topBrands, topModels, avgMileage, avgPrice) {
    return `Статистика по купленным авто\n\nВсего автомобилей куплено: ${allCars}\n\nСамые популярные марки авто:\n1. ${topBrands[0]._id} - ${topBrands[0].count}\n2. ${topBrands[1]._id} - ${topBrands[1].count}\n3. ${topBrands[2]._id} - ${topBrands[2].count}\n\nСамые популярные модели авто:\n1. ${topModels[0]._id.brand} ${topModels[0]._id.model} - ${topModels[0].count}\n2. ${topModels[1]._id.brand} ${topModels[1]._id.model} - ${topModels[1].count}\n3. ${topModels[2]._id.brand} ${topModels[2]._id.model} - ${topModels[2].count}\n\nСредние показатели:\nСредний пробег авто - ${Math.round(avgMileage[0].average)} тыс. км\nСредняя цена авто - ${Math.round(avgPrice[0].average)} тыс. руб.`
  }
  

}

export default new Menu();