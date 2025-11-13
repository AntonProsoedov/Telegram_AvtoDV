const step = 1;

export default class Slider {
  constructor(pages) {
    this.from = 0;
    this.to = step;
    this.pages = Math.ceil(pages/step);
    this.currentPage = 1;
  }
  getCurrentPage() {
    return [this.currentPage, this.pages]
  }
  getArticleForMenu() {
    return `${this.currentPage} из ${this.pages}`
  }
  firstPage(cars) {
    console.log(`${this.currentPage} из ${this.pages}`)
    return cars.slice(this.from, this.to);
  }
  nextPage(cars) {
    if (this.currentPage < this.pages) {
      this.currentPage++;
      this.from += step;
      this.to += step;
      console.log(`${this.currentPage} из ${this.pages}`)
      return cars.slice(this.from, this.to);
    }
  }
  prevPage(cars) {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.from -= step;
      this.to -= step;
      console.log(`${this.currentPage} из ${this.pages}`)
      return cars.slice(this.from, this.to);
    }
  }
}

