const searchForm = document.querySelector('.form-search'),
  inputCitiesFrom = searchForm.querySelector('.input__cities-from'),
  dropdownCitiesFrom = searchForm.querySelector('.dropdown__cities-from'),
  inputCitiesTo = searchForm.querySelector('.input__cities-to'),
  dropdownCitiesTo = searchForm.querySelector('.dropdown__cities-to'),
  inputDepartDate = searchForm.querySelector('.input__date-depart'),
  cheapestTicket = document.getElementById('cheapest-ticket'),
  otherCheapTickets = document.getElementById('other-cheap-tickets'),
  messageSpan = document.getElementById('message-span');

const citiesApi = 'db/cities.json',
  API_KEY = '762f3802bd5db44b0bc326d2b0f76c29',
  calendar = 'http://min-prices.aviasales.ru/calendar_preload',
  MAX_CARDS_AMOUNT = 10;

let cities = [];

const getData = (url, callback, rejectFunc = console.error) => {
  const request = new XMLHttpRequest();
  request.open('GET', url);

  request.addEventListener('readystatechange', () => {
    if (request.readyState !== 4) return;

    if (request.status === 200) {
      callback(request.response);
    } else {
      rejectFunc(request.status);
    }
  });
  request.send();
};

const showCity = (input, list) => {
  list.textContent = '';

  if (input.value !== '') {
    const filterCity = cities.filter(item => {
      const lowerCaseCity = item.name.toLowerCase();
      return lowerCaseCity.startsWith(input.value.toLowerCase());
    });

    filterCity.forEach(item => {
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

const getCityNameByCode = code => cities.find(c => c.code === code).name;

const formatDate = date => {
  return new Date(date).toLocaleString('ru-Ru', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const buildTicketPurchaseLink = data => {
  let link = 'https://www.aviasales.ru/search/';
  link += data.origin;

  const departDate = new Date(data.depart_date);

  const day = departDate.getDay();
  link += day < 10 ? '0' + day : day;

  const month = departDate.getMonth() + 1;
  link += month < 10 ? '0' + month : month;

  link += data.destination;
  link += '1';
  return link;
};

const createTicketCard = ticketInfo => {
  const ticket = document.createElement('article');
  ticket.classList.add('ticket');

  let card = '';

  if (ticketInfo) {
    card = `
    <h3 class="agent">${ticketInfo.gate}</h3>
    <div class="ticket__wrapper">
      <div class="left-side">
        <a href="${buildTicketPurchaseLink(ticketInfo)}" 
        target="_blank" class="button button__buy">Buy
          for ${ticketInfo.value}₽</a>
      </div>
      <div class="right-side">
        <div class="block-left">
          <div class="city__from">Departure city:
            <span class="city__name">${getCityNameByCode(ticketInfo.origin)}</span>
          </div>
          <div class="date">${formatDate(ticketInfo.depart_date)}</div>
        </div>
        <div class="block-right">
          <div class="changes">${
            (ticketInfo.number_of_changes === 0 ? 'Non-stop' 
            : ticketInfo.number_of_changes + '-stop flights')
          }
          </div>
          <div class="city__to">Destination city:
            <span class="city__name">${getCityNameByCode(ticketInfo.destination)}</span>
          </div>
        </div>
      </div>
    </div>
    `;
  } else {
    card = '<h3>There are no available tickets for this date</h3>';
  }
  ticket.insertAdjacentHTML('afterbegin', card);

  return ticket;
};

const renderTodayCheapTickets = cheapTickets => {
  cheapestTicket.style.display = 'block';
  cheapestTicket.innerHTML ='<h2>The cheapest ticket for the selected date</h2>';

  const ticket = createTicketCard(cheapTickets[0]);
  cheapestTicket.append(ticket);
};

const renderAllCheapTickets = cheapTickets => {
  otherCheapTickets.style.display = 'block';
  otherCheapTickets.innerHTML = '<h2>Cheapest tickets for other dates</h2>';

  cheapTickets.sort((a, b) => a.value - b.value);

  for (let i = 0; i < cheapTickets.length && i < MAX_CARDS_AMOUNT; i++) {
    const ticket = createTicketCard(cheapTickets[i]);
    otherCheapTickets.append(ticket);
  }
};

const renderTickets = (data, date) => {
  const allCheapTickets = JSON.parse(data).best_prices;
  const todayCheapTikets = allCheapTickets.filter(t => t.depart_date === date);
  
  renderTodayCheapTickets(todayCheapTikets);
  renderAllCheapTickets(allCheapTickets);
};

const clearTicketsInfo = () => {
  cheapestTicket.textContent = '';
  otherCheapTickets.textContent = '';
};

document.body.addEventListener('click', () => {
  dropdownCitiesFrom.style.display = "none";
  dropdownCitiesTo.style.display = "none";
});

inputCitiesFrom.addEventListener('input', () => {
  dropdownCitiesFrom.style.display = "block";
  showCity(inputCitiesFrom, dropdownCitiesFrom);
});

inputCitiesTo.addEventListener('input', () => {
  dropdownCitiesTo.style.display = "block";
  showCity(inputCitiesTo, dropdownCitiesTo);
});

dropdownCitiesFrom.addEventListener('click', event => {
  selectCity(event, inputCitiesFrom, dropdownCitiesFrom);
});

dropdownCitiesTo.addEventListener('click', event => {
  selectCity(event, inputCitiesTo, dropdownCitiesTo);
});

searchForm.addEventListener('submit', event => {
  event.preventDefault();

  messageSpan.textContent = '';

  const cityFrom = cities.find(item => inputCitiesFrom.value === item.name);
  const cityTo = cities.find(item => inputCitiesTo.value === item.name);

  const formData = {
    from: cityFrom,
    to: cityTo,
    when: inputDepartDate.value
  };

  if (formData.from && formData.to) {
    const requestData =
      '?depart_date=' + formData.when +
      '&origin=' + formData.from.code +
      '&destination=' + formData.to.code +
      '&one_way=true';

    getData(
      calendar + requestData,
      response => {
        renderTickets(response, formData.when);
      },
      ex => {
        messageSpan.insertAdjacentHTML('afterbegin', '<h2>There are no flights on this direction!</h2>');
        clearTicketsInfo();
      }
    );
  } else {
    messageSpan.insertAdjacentHTML('afterbegin', '<h2>Invalid city name entered!</h2>');
    clearTicketsInfo();
  }
});

getData(citiesApi, data => {
  cities = JSON.parse(data).filter(city => city.name);

  cities.sort((a, b) => {
    if (a.value > b.value) {
      return 1;
    }
    if (a.value < b.value) {
      return -1;
    }
    return 0;
  });
});