import puppeteer from 'puppeteer'

async function getCurrencyRate() {
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();
  await page.setViewport({width: 1980, height: 1024})
  await page.setGeolocation({latitude: 52.4620, longitude: 103.3849});
  await page.goto('https://www.atb.su/')
  await page.$eval('.js-open-geo', el => el.click());
  await page.waitForSelector('.header__geo', { timeout: 5000 });
  await page.$$eval('.header__geo-list button', (el) => {
    el.forEach(btn => {
      btn.innerText == 'Иркутская область'? (btn.click()) : false;
    })
  });
  await page.waitForSelector('.ajax-cities button', { timeout: 5000 });
  await page.$$eval('.ajax-cities button', (el) => {
    el.forEach(btn => {
      btn.innerText == 'Усолье-Сибирское'? (btn.click()) : false;
    })
  });

  await page.waitForNavigation({
    waitUntil: 'load',
    timeout: 5000
  });

  await page.tap('.currency__ui-select')//Открыть вкладку с выбором курса валют
  await page.click('.select2-results li:last-child');//Кликнуть на кнопку 'для денежных переводов'

  const value = await page.$$eval('.currency-table > .currency-table__tr', (el) => {
    let target;
    el.forEach(tr => {
      if (tr.querySelector('.currency-table__val').innerText == 'JPY') {
        target = (String(tr.querySelector('.currency-table__td:last-child:last-child').textContent).replace(/[^\d.]/g, ''))
      }
    })
    
    return target
  })
  // console.log(value)
  return value
  
};

export default getCurrencyRate;