import { getSummary, getCountries, getByCountryAllStatus } from './http.js';

const confirmed = document.getElementById('confirmed');
const death = document.getElementById('death');
const recovered = document.getElementById('recovered');
const date = document.getElementById('date');

function renderTotalData(globalData) {
  confirmed.textContent = globalData.TotalConfirmed.toLocaleString('pt-BR');
  death.textContent = globalData.TotalDeaths.toLocaleString('pt-BR');
  recovered.textContent = globalData.TotalRecovered.toLocaleString('pt-BR');
  let lastDate = new Date(globalData.Date).toLocaleString('pt-BR');
  let hour;
  [lastDate, hour] = lastDate.split(' ');
  date.textContent = `Data de atualização: ${lastDate} ${hour.substr(0, 5)}`;
}

function renderNewData(globalData) {
  let pizza = new Chart(document.getElementById('pizza'), {
    type: 'pie',
    data: {
      labels: ['Confirmados', 'Recuperados', 'Mortes'],
      datasets: [
        {
          data: [
            globalData.NewConfirmed,
            globalData.NewRecovered,
            globalData.NewDeaths,
          ],
          backgroundColor: ['#F08080', '#1E90FF', '#FFD700'],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Distribuição de novos casos',
        },
      },
    },
  });
}

function renderTop10TotalDeaths(countriesData) {
  countriesData = _.orderBy(countriesData, ['TotalDeaths'], ['desc']);
  countriesData = _.slice(countriesData, 0, 10);
  let countriesNames = _.map(countriesData, country => {
    return country.Country;
  });
  let countriesTotalDeaths = _.map(countriesData, country => {
    return country.TotalDeaths;
  });

  let bar = new Chart(document.getElementById('barras'), {
    type: 'bar',
    data: {
      labels: countriesNames,
      datasets: [
        {
          data: countriesTotalDeaths,
          backgroundColor: '#6959CD',
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: 'Total de Mortes por país - Top 10',
        },
      },
    },
  });
}

async function init() {
  console.log('index page');
  let summary = await getSummary();
  let globalData = summary.Global;
  let countriesData = summary.Countries;
  renderTotalData(globalData);
  renderNewData(globalData);
  renderTop10TotalDeaths(countriesData);
}

init();
