document.addEventListener('DOMContentLoaded', function () {

    bulmaCalendar.attach('#datepickerDemoDefault', {
        displayMode: 'dialog',
        startDate: new Date(),
        minDate: '01/01/2020',
        maxDate: '12/31/2500',
        lang: 'fr'
    });

    const element = document.querySelector('#datepickerDemoDefault');

    if (element) {
        // bulmaCalendar instance is available as element.bulmaCalendar
        element.bulmaCalendar.on('select', function(datepicker) {
            console.log(datepicker.data.value());
        });
    }

});