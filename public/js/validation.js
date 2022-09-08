const isEmpty = (ele) => {
    if (ele.value === "") {
      ele.classList.add("is-danger");
    } else {
      ele.classList.remove("is-danger");
      ele.classList.add("is-success");
    }
};