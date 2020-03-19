const formSearch = document.querySelector('.form-search'),
  inputCitiesFrom = formSearch.querySelector('.input__cities-from'),
  dropdownCitiesFrom = formSearch.querySelector('.dropdown__cities-from'),
  inputCitiesTo = formSearch.querySelector('.input__cities-to'),
  dropdownCitiesTo = formSearch.querySelector('.dropdown__cities-to'),
  inputDateDepart = formSearch.querySelector('.input__date-depart');

const citiesApi = 'db/cities.json',
  API_KEY = '762f3802bd5db44b0bc326d2b0f76c29',
  calendar = 'http://min-prices.aviasales.ru/calendar_preload';

let cities = [];

const getData = (url, callback) => {
  const request = new XMLHttpRequest();

  request.open('GET', url);

  request.addEventListener('readystatechange', () => {
    if (request.readyState !== 4) return;

    if (request.status === 200) {
      callback(request.response);
    } else {
      console.error(request.status);
    }
  });
  request.send();
};

const showCity = (input, list) => {
  list.textContent = '';

  if (input.value !== '') {
    const filterCity = cities.filter((item) => {
      const lowerCaseCity = item.name.toLowerCase();
      return lowerCaseCity.includes(input.value.toLowerCase());
    });

    filterCity.forEach((item) => {
      const li = document.createElement('li');
      li.classList.add('dropdown__city');
      li.textContent = item.name;
      list.append(li);
    });
  }
};

const selectCity = (event, input, list) => {
  const target = event.target;
  if (target.tagName.toLowerCase() === 'li') {
    input.value = target.textContent;
    list.textContent = '';
  }
};

const renderTodayCheapTickets = (cheapTickets) => {
  console.log(cheapTickets);
};

const renderAllCheapTickets = (cheapTickets) => {
  console.log(cheapTickets);
};

const renderCheap = (data, date) => {
  const allCheapTickets = JSON.parse(data).best_prices;

  const todayCheapTikets = allCheapTickets.filter((item) => {
    return item.depart_date === date;
  });

  renderTodayCheapTickets(todayCheapTikets);
  renderAllCheapTickets(allCheapTickets);
};

inputCitiesFrom.addEventListener('input', () => {
  showCity(inputCitiesFrom, dropdownCitiesFrom);
});

inputCitiesTo.addEventListener('input', () => {
  showCity(inputCitiesTo, dropdownCitiesTo);
});

dropdownCitiesFrom.addEventListener('click', (event) => {
  selectCity(event, inputCitiesFrom, dropdownCitiesFrom);
});

dropdownCitiesTo.addEventListener('click', (event) => {
  selectCity(event, inputCitiesTo, dropdownCitiesTo);
});

formSearch.addEventListener('submit', (event) => {
  event.preventDefault();

  const cityFrom = cities.find((item) => inputCitiesFrom.value === item.name); 
  const cityTo   = cities.find((item) => inputCitiesTo.value === item.name); 
  
  const formData = {
    from: cityFrom.code,
    to:   cityTo.code,
    when: inputDateDepart.value
  };

  const requestData = '?depart_date=' + formData.when +
    '&origin=' + formData.from +
    '&destination=' + formData.to +
    '&one_way=true';

  getData(calendar + requestData, (response) => {
    renderCheap(response, formData.when);
  });
});

getData(citiesApi, data => {
  cities = JSON.parse(data).filter(item => item.name);
});