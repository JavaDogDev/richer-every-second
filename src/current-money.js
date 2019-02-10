/**
 * Keeps track of the current "earned income" and "paid taxes" values
 * so they can be used across modules.
 */
class CurrentMoney {
  constructor() {
    this.income = 0.00;
    this.taxes = 0.00;
  }

  update(income = 0.00, taxes = 0.00) {
    this.income = income;
    this.taxes = taxes;
  }

  getIncome() {
    return this.income;
  }

  getTaxes() {
    return this.taxes;
  }
}

export default new CurrentMoney();
