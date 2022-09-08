

document.getElementById('start_date').value = moment().format("YYYY-MM-DD");

const filter = (tenant) => {
  const filterBy = document.getElementById("filter");
  const selectedFilter = filterBy.options[filterBy.selectedIndex].value;
  window.location.href =
    "/appointments/" + tenant + "?filter=" + selectedFilter;
};
const dismiss = (ele) => {
  document.getElementById("notification").style.display = "none";
};

// TODO write validation in own file



const view = (appointment) => {
  console.log(appointment)
  document.getElementById('view').classList.toggle('is-active');
  const apt = JSON.parse(appointment);
  document.getElementById("v_status").value = apt.status;
  document.getElementById("v_name").value = apt.first_name + " " + apt.last_name;
  document.getElementById("v_email").value = apt.email;
  document.getElementById("v_contact").value = apt.contact;
  document.getElementById("v_apt_date").value = moment(apt.start_date).format("ddd D MMM YYYY");
  document.getElementById("v_apt_time").value = apt.start_time;
  document.getElementById("v_service").value = apt.service;
}

const confirmApt = (event) => {
  event.preventDefault();
  const first_name = document.getElementById("first_name").value;
  const last_name = document.getElementById("last_name").value;
  const email = document.getElementById("email").value;
  const contact = document.getElementById("contact").value;
  const start_date = document.getElementById("start_date").value;
  const start_time = document.getElementById("apt_time");
  const service = document.getElementById("service");
  const selectedTime = start_time.options[start_time.selectedIndex].value;
  if(first_name === "" || last_name === "" || email ==="" || contact===""){
    document.getElementById("validation-message").innerHTML = "Please review the errors below.";
    return;
  }else{
    document.getElementById("create").classList.remove("is-active");
    document.getElementById("confirm-apt").classList.toggle("is-active");
    document.getElementById("c_name").value = first_name + " " + last_name;
    document.getElementById("c_email").value = email;
    document.getElementById("c_contact").value = contact;
    document.getElementById("c_apt_date").value = start_date;
    document.getElementById("c_apt_time").value = selectedTime;
    document.getElementById("c_service").value =
    service.options[service.selectedIndex].text;
  }
  
};

const createApt = (event, tenant) => {
  event.preventDefault();
  const first_name = document.getElementById("first_name").value;
  const last_name = document.getElementById("last_name").value;
  const email = document.getElementById("email").value;
  const contact = document.getElementById("contact").value;
  const start_date = document.getElementById("start_date").value;
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
  document.getElementById("create").classList.remove("is-active");
  document.getElementById("confirm-apt").classList.remove("is-active");
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
      document.getElementById("new-apt").classList.toggle("is-active");
    });
};

const openModal = async (modalId, appointmentId) => {
  const id = JSON.parse(appointmentId);
  const data = await getAppointmentById(id);
  populateModal(modalId, data);
  document.getElementById(modalId).classList.toggle("is-active");
};

const getAppointmentById = async (id) => {
  const url = `/api/appointments/${id}`;
  return await fetch(url)
    .then((response) => response.json())
    .then((data) => data);
};

const populateModal = (modalId, appointment) => {
  let messageId;
  let messageBody;
  const d = new Date(appointment.start_date);
  if(modalId == 'cancel'){
    messageId = 'cancel-message';
    messageBody = `Are you sure want to <strong>cancel</strong> appointment for <strong>${appointment.first_name} ${appointment.last_name}</strong> on <strong>${moment(d).format('dddd, D MMMM YYYY')}</strong> at <strong>${appointment.start_time}</strong>?`;
  }
  if(modalId == 'change-status'){
    messageId = 'change-status-message';
    messageBody = `Are you sure want to <strong>confirm</strong> appointment for <strong>${appointment.first_name} ${appointment.last_name}</strong> on <strong>${moment(d).format('dddd, D MMMM YYYY')}</strong> at <strong>${appointment.start_time}</strong>?`;
  } 
  let message = document.getElementById(messageId);
  message.innerHTML = messageBody;
  message.dataset.id = appointment.id;
};


const updateAppointmentStatus = (status, modalId) => {
  let message;
  if(modalId == 'cancel') message = document.getElementById("cancel-message");
  if(modalId == 'change-status') message = document.getElementById("change-status-message");
  const id = message.dataset["id"];
  const url = `/api/appointments/${id}`;
  const requestOptions = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: status }),
  };
  fetch(url, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      document.getElementById(modalId).classList.toggle("is-active");
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
    for (i = 1; i < rows.length - 1; i++) {
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
};
