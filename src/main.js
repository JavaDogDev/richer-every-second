import Cookies from 'js-cookie';

import CurrentMoney from './current-money';
import './index.scss';

document.addEventListener('DOMContentLoaded', () => {
  const UPDATE_FREQUENCY_MS = 100;

  /* Screen 1 */
  const screen1 = document.getElementById('container-screen1');
  const screen2 = document.getElementById('container-screen2');
  const form = document.getElementById('data-form');
  const checkboxIncludeTaxes = document.getElementById('include-taxes');
  const inputTaxes = document.getElementById('annual-tax');
  const checkboxAlreadyWorked = document.getElementById('already-worked-some');
  const inputWorkedHours = document.getElementById('already-worked-hours');

  checkboxIncludeTaxes.addEventListener('change', function handleCheck() {
    inputTaxes.disabled = !this.checked;
    inputTaxes.required = this.checked;
  });

  checkboxAlreadyWorked.addEventListener('change', function handleCheck() {
    inputWorkedHours.disabled = !this.checked;
    inputWorkedHours.required = this.checked;
  });

  function roundNum(value, decimals) {
    // eslint-disable-next-line prefer-template
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals).toFixed(decimals);
  }

  function fireChangeEvent(inputField) {
    inputField.dispatchEvent(new UIEvent('change'));
  }

  // Load previous data from cookie
  const cookieData = Cookies.getJSON('res-data');
  if (typeof cookieData !== 'undefined' && cookieData.hasOwnProperty('annualIncome')) {
    Object.keys(cookieData).forEach((key) => {
      if (form.elements[key].type === 'checkbox') {
        form.elements[key].checked = cookieData[key];
        fireChangeEvent(form.elements[key]);
      } else {
        form.elements[key].value = cookieData[key];
      }
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    // Save entered data to cookie
    const newCookie = {};
    const excludeKeys = new Set([
      'already-worked-some',
      'alreadyWorkedSome',
      'already-worked-hours',
      'alreadyWorkedHours',
    ]);
    // forms have numeric keys we have to filter out
    const numberRegex = /^\d+$/;
    Object.keys(form.elements).forEach((key) => {
      if (!excludeKeys.has(key) && !numberRegex.test(key)) {
        if (form.elements[key].type === 'checkbox') {
          newCookie[key] = form.elements[key].checked;
        } else {
          newCookie[key] = form.elements[key].value;
        }
      }
    });
    Cookies.set('res-data', newCookie, { expires: 365 });

    // eslint-disable-next-line no-use-before-define
    initScreen2();

    // Launch second screen
    screen1.addEventListener('transitionend', (e) => {
      if (e.propertyName === 'opacity') {
        screen1.style.display = 'none';

        screen2.style.display = 'flex';
        window.setTimeout(() => {
          screen2.style.opacity = 1;
        }, 100);
      }
    });
    screen1.style.opacity = 0;
  });

  /* Screen 2 */
  function initScreen2() {
    const sinceStartingText = document.getElementById('since-starting-text');
    const cashDisplay = document.getElementById('cash-display');
    const taxesPaidArea = document.getElementById('taxes-paid');
    const taxesPaidDisplay = document.getElementById('taxes-paid-display');

    const startTime = Date.now();
    const workdaysPerWeek = parseInt(form.workdaysPerWeek.value, 10);
    const workHoursPerDay = parseInt(form.hoursPerDay.value, 10);
    const workHoursPerYear = (workdaysPerWeek * workHoursPerDay) * 52.1775; // weeks per year
    const hourlyIncome = parseFloat(form.annualIncome.value) / workHoursPerYear;
    const hourlyTax = parseFloat(form.annualTax.value) / workHoursPerYear;
    const workedHours = parseFloat(form.alreadyWorkedHours.value);

    sinceStartingText.innerHTML = form.alreadyWorkedSome.checked
      ? 'So far today, you\'ve made:'
      : 'Since pressing start, you\'ve made:';

    taxesPaidArea.style.display = form.includeTaxes.checked
      ? 'block'
      : 'none';

    function moneyPerCentisecond(cashPerHour, startingTime) {
      // a centisecond is 1/100 of one second, and there are 360000 of them per hour
      const cashPerCentisecond = cashPerHour / 360000;
      const timeElapsedCS = (Date.now() - startingTime) / 10;
      return timeElapsedCS * cashPerCentisecond;
    }

    function updateDisplay() {
      let income = moneyPerCentisecond(hourlyIncome, startTime);
      let taxes = 0;

      if (form.includeTaxes.checked) {
        taxes = moneyPerCentisecond(hourlyTax, startTime);
        income -= taxes;
      }

      if (form.alreadyWorkedSome.checked) {
        income += (workedHours * hourlyIncome);

        if (form.includeTaxes.checked) {
          const pastTax = (workedHours * hourlyTax);
          income -= pastTax;
          taxes += pastTax;
        }
      }

      income = roundNum(
        income,
        (form.displayFractionalPennies.checked) ? 4 : 2);
      taxes = roundNum(
        taxes,
        (form.displayFractionalPennies.checked) ? 4 : 2);

      CurrentMoney.update(income, taxes);

      if (form.includeTaxes.checked) {
        taxesPaidDisplay.innerHTML = `$${CurrentMoney.getTaxes()}`;
      }

      cashDisplay.innerHTML = `$${CurrentMoney.getIncome()}`;
    }

    setInterval(updateDisplay.bind(this), UPDATE_FREQUENCY_MS);
  }
});
