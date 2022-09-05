const openNewModalById = (id) => {
    document.getElementById(id).classList.toggle('is-active');
}

const closeModalById = (id, action, event) => {
    event.preventDefault();
    document.getElementById(id).classList.toggle('is-active');
    if(action === 'reload') window.location.reload();
}