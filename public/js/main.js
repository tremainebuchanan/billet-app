const dismiss = (ele) => {
  document.getElementById("notification").style.display = "none";
};

// TODO write validation in own file

const isEmpty = (ele) => {
  if (ele.value === "") {
    ele.classList.add("is-danger");
  } else {
    ele.classList.remove("is-danger");
    ele.classList.add("is-success");
  }
};

const confirmApt = (event) => {
  event.preventDefault();
  document.getElementById('create').classList.remove('is-active')
  document.getElementById('confirm-apt').classList.toggle('is-active')
  const first_name = document.getElementById("first_name").value;
  const last_name = document.getElementById("last_name").value;
  const email = document.getElementById("email").value;
  const contact = document.getElementById("contact").value;
  const start_date = document.getElementById("apt_date").value;
  const start_time = document.getElementById("apt_time");
  const service = document.getElementById("service");
  const selectedTime = start_time.options[start_time.selectedIndex].value;
  document.getElementById("c_name").value = first_name + " " + last_name;
  document.getElementById("c_email").value = email;
  document.getElementById("c_contact").value = contact;
  document.getElementById("c_apt_date").value = start_date;
  document.getElementById("c_apt_time").value = selectedTime;
  document.getElementById("c_service").value = service.options[service.selectedIndex].text
};

const createApt = (event, tenant) => {
  event.preventDefault();
  const first_name = document.getElementById("first_name").value;
  const last_name = document.getElementById("last_name").value;
  const email = document.getElementById("email").value;
  const contact = document.getElementById("contact").value;
  const start_date = document.getElementById("apt_date").value;
  const start_time = document.getElementById("apt_time");
  const service = document.getElementById("service");
  const selectedService = service.options[service.selectedIndex].value;
  const selectedTime = start_time.options[start_time.selectedIndex].value;
  sendAptData({
    first_name,
    last_name,
    email,
    contact,
    tenant_id: JSON.parse(tenant),
    service: selectedService,
    start_date,
    start_time: selectedTime,
  });
  //document.getElementById('create').classList.remove('is-active');
  document.getElementById('confirm-apt').classList.remove('is-active');

};

//TODO create api file

const sendAptData = (appointment) => {
  const url = "/api/appointments";
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(appointment),
  };
  fetch(url, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      //window.location.reload()
      document.getElementById('new-apt').classList.toggle('is-active')
    });
};

const openModal = (modalId, appointmentId) => {
  const id = JSON.parse(appointmentId);
  getAppointmentById(id);
  document.getElementById(modalId).classList.toggle("is-active");
};

const getAppointmentById = (id) => {
  const url = `/api/appointments/${id}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const id = data.id;
      const name = data.first_name + " " + data.last_name;
      const date = data.start_date;
      const time = data.start_time;
      addCancelMessage(id, name, date, time);
    });
};

const addCancelMessage = (id, name, date, time) => {
  let message = document.getElementById("cancel-message");
  const [d, t] = formatDate(new Date(date)).split(" ");
  message.innerHTML = `Are you sure want to <strong>cancel</strong> appointment for <strong>${name}</strong> on <strong>${moment(
    date
  ).format("dddd, MMMM D")}</strong> at <strong>${time}</strong>?`;
  message.dataset.id = id;
};

const cancelAppointment = () => {
  const message = document.getElementById("cancel-message");
  const id = message.dataset["id"];
  const url = `/api/appointments/${id}`;
  const requestOptions = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "Cancelled"}),
  };
  fetch(url, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("cancel").classList.toggle("is-active");
      console.log(data);
      window.location.reload();
    });
};

const buildModal = (data) => {
  const div = document.createElement("div");
  const dateInput = document.createElement("input");
  const input = document.createElement("input");
  const timeInput = document.createElement("input");
  timeInput.setAttribute("type", "time");
  dateInput.setAttribute("type", "date");
  var now = new Date();
  const [date, time] = formatDate(new Date()).split(" ");
  var day = ("0" + now.getDate()).slice(-2);
  var month = ("0" + (now.getMonth() + 1)).slice(-2);
  var today = now.getFullYear() + "-" + month + "-" + day;
  dateInput.value = today;
  dateInput.className += "input ";
  timeInput.className += "input";
  timeInput.value = time;
  input.setAttribute("type", "text");
  input.setAttribute("readonly", true);
  input.className += "input ";
  input.className += "is-static";
  input.value = data.name;
  document.getElementById("customer_name").innerHTML = "";
  document.getElementById("customer_name").appendChild(input);
  document.getElementById("start_date").innerHTML = "";
  document.getElementById("start_date").appendChild(dateInput);
  document.getElementById("start_time").innerHTML = "";
  document.getElementById("start_time").appendChild(timeInput);
};

function padTo2Digits(num) {
  return num.toString().padStart(2, "0");
}

function formatDate(date) {
  return (
    [
      date.getFullYear(),
      padTo2Digits(date.getMonth() + 1),
      padTo2Digits(date.getDate()),
    ].join("-") +
    " " +
    [padTo2Digits(date.getHours()), padTo2Digits(date.getMinutes())].join(":")
  );
}

const saveEdit = (tenant, id) => {
  const first_name = document.getElementById("first_name").value;
  const last_name = document.getElementById("last_name").value;
  const email = document.getElementById("email").value;
  const contact = document.getElementById("contact").value;
  const start_date = document.getElementById("apt_date").value;
  const start_time = document.getElementById("apt_time");
  const service = document.getElementById("service");
  const selectedService = service.options[service.selectedIndex].value;
  const selectedTime = start_time.options[start_time.selectedIndex].value;
  const data = {
    first_name,
    last_name,
    email,
    contact,
    tenant_id: JSON.parse(tenant),
    service: selectedService,
    start_date,
    start_time: selectedTime,
  };
  sendEdit(data, JSON.parse(id));
};

const sendEdit = (appointment, id) => {
  const url = "/api/appointments/" + id;
  const requestOptions = {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(appointment),
  };
  fetch(url, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      document.getElementById("notification").style.display = "block";
      document.getElementById("message-text").innerHTML =
        "<strong>Appointment successfully updated.</strong>";
    });
};

const sortTable = () => {
  var table, rows, switching, i, x, y, shouldSwitch;
  table = document.getElementById("myTable");
  switching = true;
  /*Make a loop that will continue until
  no switching has been done:*/
  while (switching) {
    //start by saying: no switching is done:
    switching = false;
    rows = table.rows;
    /*Loop through all table rows (except the
    first, which contains table headers):*/
    for (i = 1; i < (rows.length - 1); i++) {
      //start by saying there should be no switching:
      shouldSwitch = false;
      /*Get the two elements you want to compare,
      one from current row and one from the next:*/
      x = rows[i].getElementsByTagName("TD")[0];
      y = rows[i + 1].getElementsByTagName("TD")[0];
      //check if the two rows should switch place:
      if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
        //if so, mark as a switch and break the loop:
        shouldSwitch = true;
        break;
      }
    }
    if (shouldSwitch) {
      /*If a switch has been marked, make the switch
      and mark that a switch has been done:*/
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
}