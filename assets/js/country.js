import { getSummary, getCountries, getByCountryAllStatus } from './http.js';

let summary = [];
let countries = [];
let countrySlug;
let lines;

const dateStart = document.getElementById('date_start');
const dateEnd = document.getElementById('date_end');
const selectCountry = document.getElementById('cmbCountry');
const selectData = document.getElementById('cmbData');
const applyButton = document.getElementById('filtro');
const kpiconfirmed = document.getElementById('kpiconfirmed');
const kpideaths = document.getElementById('kpideaths');
const kpirecovered = document.getElementById('kpirecovered');

function simplifyDate(data) {
  let outputData;
  let trash;
  [outputData, ...trash] = data.toISOString().split('T');
  return outputData;
}

function renderCountryList() {
  countries = _.orderBy(countries, ['Country'], ['cresc']);
  for (const country of countries) {
    const elementCountry = document.createElement('option');
    elementCountry.textContent = country.Country;
    selectCountry.appendChild(elementCountry);
  }
  let initialIndex = _.findIndex(countries, country => {
    return country.Country == 'Brazil';
  });
  selectCountry.options.selectedIndex = initialIndex;
}

function renderTotalData() {
  countrySlug = countries[selectCountry.options.selectedIndex].Slug;
  let arrayCountries = summary.Countries;
  let selectedCountry = _.find(arrayCountries, country => {
    return country.Slug == countrySlug;
  });
  kpiconfirmed.textContent = selectedCountry.TotalConfirmed;
  kpideaths.textContent = selectedCountry.TotalDeaths;
  kpirecovered.textContent = selectedCountry.TotalRecovered;
}

async function dailyCurveCalculation() {
  let dataType = selectData.value;
  let dailyDataByCountry = await getByCountryAllStatus(
    countrySlug,
    dateStart.value,
    dateEnd.value
  );
  let data = [];
  if (dataType === 'Confirmed') {
    data = _.map(dailyDataByCountry, country => {
      return { targetAttribute: country.Confirmed, Date: country.Date };
    });
  } else if (dataType === 'Deaths') {
    data = _.map(dailyDataByCountry, country => {
      return { targetAttribute: country.Deaths, Date: country.Date };
    });
  } else {
    data = _.map(dailyDataByCountry, country => {
      return { targetAttribute: country.Recovered, Date: country.Date };
    });
  }
  let inferiorLimit = data[0].Date.split('T');
  let upperLimit = data[data.length - 1].Date.split('T');
  upperLimit = new Date(`${upperLimit[0]}T00:00:00`);
  inferiorLimit = new Date(`${inferiorLimit[0]}T00:00:00`);
  let days = [];
  days.push(simplifyDate(inferiorLimit));
  for (;;) {
    inferiorLimit.setDate(inferiorLimit.getDate() + 1);
    if (upperLimit >= inferiorLimit) {
      days.push(simplifyDate(inferiorLimit));
    } else {
      break;
    }
  }
  let newData = [];
  let arrayDailyData = [];
  let index = 0;
  for (let day of days) {
    let result = _.filter(data, d => {
      return d.Date === `${day}T00:00:00Z`;
    });
    result = result.reduce((summ, currentValue) => {
      return summ + currentValue.targetAttribute;
    }, 0);
    newData.push({ targetAttribute: result, Date: day });
    if (index > 0) {
      arrayDailyData.push({
        dailyData:
          newData[index].targetAttribute - newData[index - 1].targetAttribute,
        Date: newData[index].Date,
      });
    }
    index++;
  }
  console.log(newData);
  console.log(arrayDailyData);
  let averageDailyData = _.reduce(
    arrayDailyData,
    (summ, currentValue) => {
      return summ + currentValue.dailyData;
    },
    0
  );
  averageDailyData = averageDailyData / arrayDailyData.length;
  let arrayAverageDailyData = [];
  for (index = 0; index < arrayDailyData.length; index++) {
    arrayAverageDailyData.push(averageDailyData);
  }
  console.log(arrayAverageDailyData);
  let legends = ['Confirmações', 'Mortes', 'Recuperações'];
  lines = new Chart(document.getElementById('linhas'), {
    type: 'line',
    data: {
      labels: _.map(arrayDailyData, dailyData => dailyData.Date),
      datasets: [
        {
          data: _.map(arrayDailyData, dailyData => dailyData.dailyData),
          label: `Número de ${legends[selectData.options.selectedIndex]}`,
          borderColor: 'rgb(60, 186, 159)',
          backgroundColor: 'rgb(60, 186, 159, 0.1)',
        },
        {
          data: arrayAverageDailyData,
          label: `Média de ${legends[selectData.options.selectedIndex]}`,
          borderColor: 'rgb(255, 140, 13)',
          backgroundColor: 'rgb(255, 140, 13, 0.1)',
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        title: {
          display: true,
          text: 'Curva diária de Covid-19',
        },
      },
    },
  });
}

function updateFilter() {
  renderTotalData();
  lines.destroy();
  dailyCurveCalculation();
}

async function init() {
  console.log('country page');
  summary = await getSummary();
  countries = await getCountries();
  /*  let dailyDataByCountry = await getByCountryAllStatus(
    'brazil',
    '2021-07-22',
    '2021-07-23'
  ); */
  let resto;
  [dateEnd.value, ...resto] = summary.Date.split('T');
  let startDate = new Date(dateEnd.value);
  startDate.setDate(startDate.getDate() - 30);
  startDate = startDate.toISOString();
  [dateStart.value, ...resto] = startDate.split('T');
  renderCountryList();
  renderTotalData();
  dailyCurveCalculation();
  applyButton.addEventListener('click', updateFilter);
}

init();
