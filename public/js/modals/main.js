const openNewModalById = (id) => {
    document.getElementById(id).classList.toggle('is-active');
}

const closeModalById = (id, action) => {
    document.getElementById(id).classList.toggle('is-active');
    //document.getElementById('create').classList.
    if(action === 'reload') window.location.reload();
}