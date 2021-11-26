const apiCovid19 = axios.create({
  baseURL: 'https://api.covid19api.com/',
});

async function getSummary() {
  try {
    let response = await apiCovid19.get('summary');
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

async function getCountries() {
  try {
    let response = await apiCovid19.get('countries');
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

async function getByCountryAllStatus(countrySlug, initialDate, finalDate) {
  try {
    let response = await apiCovid19.get(
      `country/${countrySlug}?from=${initialDate}T00:00:00Z&to=${finalDate}T00:00:00Z`
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export { getSummary, getCountries, getByCountryAllStatus };

/*
console.log(dateEnd.value);
  let upperLimit = new Date(`${dateEnd.value}T00:00:00`);
  console.log(upperLimit);
  console.log(dateStart.value);
  let inferiorLimit = new Date(`${dateStart.value}T00:00:00`);
  console.log(inferiorLimit);
  let dateArray = [];
  dateArray.push(simplifyDate(upperLimit));
  for (;;) {
    upperLimit.setDate(upperLimit.getDate() - 7);
    let upperLimit2 = new Date(upperLimit.toISOString());
    upperLimit2.setDate(upperLimit2.getDate() - 1);
    if (upperLimit > inferiorLimit) {
      dateArray.push(simplifyDate(upperLimit));
      dateArray.push(simplifyDate(upperLimit2));
    } else {
      break;
    }
    console.log(upperLimit.toISOString());
  }
  dateArray.push(dateStart.value);
  console.log(dateArray);
  */
