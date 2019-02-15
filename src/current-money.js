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

  /**
   * Gets the list of 3D models needed to represent the current val of this.income.
   * @param availableModels array of numbers representing the value of each available 3D model
   * @returns Map like (0.01 => 4), (0.05 => 1) -- 4 pennies 1 nickel
   */
  getChangeAmounts(availableValues) {
    let remainingIncome = this.getIncome();
    const sortedValues = [...availableValues].sort((a, b) => b - a);
    const result = new Map();
    sortedValues.forEach((currencyValue) => {
      while (remainingIncome > currencyValue) {
        if (!result.has(currencyValue)) {
          result.set(currencyValue, 1);
        } else {
          result.set(currencyValue, result.get(currencyValue) + 1);
        }
        remainingIncome -= currencyValue;
      }
    });
    return result;
  }
}

export default new CurrentMoney();
