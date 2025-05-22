document.addEventListener('DOMContentLoaded', function () {
    const calendarDiv = document.getElementById('calendar');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();
    let bookedDates = [];

    function fetchAvailability() {
        fetch('availability.json')
            .then(response => response.json())
            .then(data => {
                if (data && data.booked_dates) {
                    bookedDates = data.booked_dates;
                    renderCalendar(currentYear, currentMonth);
                } else {
                    console.error('Invalid availability data:', data);
                    calendarDiv.innerHTML = '<p>Could not load availability.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching availability:', error);
                calendarDiv.innerHTML = '<p>Could not load availability.</p>';
            });
    }

    function renderCalendar(year, month) {
        calendarDiv.innerHTML = ''; // Clear previous calendar

        const today = new Date();
        const currentDay = today.getDate();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        let startingDay = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.

        // Adjust starting day so 0 is Monday and 6 is Sunday
        if (startingDay === 0) {
            startingDay = 6; // Sunday becomes 6
        } else {
            startingDay--; // Other days shift back by one
        }

        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const monthTitle = document.createElement('h2');
        monthTitle.textContent = `${monthNames[month]} ${year}`;
        calendarDiv.appendChild(monthTitle);

        const table = document.createElement('table');
        let row = table.insertRow();

        const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        for (let day of daysOfWeek) {
            let th = document.createElement('th');
            th.textContent = day;
            row.appendChild(th);
        }
        table.appendChild(row); // Append header row

        let dayCounter = 1;
        let rowCount = 0;
        for (let i = 0; i < 6; i++) { // Attempt up to 6 weeks
            row = table.insertRow();
            let daysInRow = 0;
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < startingDay) {
                    let cell = row.insertCell();
                    cell.textContent = '';
                } else if (dayCounter > daysInMonth) {
                    let cell = row.insertCell();
                    cell.textContent = 'x';
                } else {
                    let cell = row.insertCell();
                    cell.textContent = dayCounter;

                    const cellDate = new Date(year, month, dayCounter);
                    const cellYear = cellDate.getFullYear();
                    const cellMonth = (cellDate.getMonth() + 1 < 10 ? '0' : '') + (cellDate.getMonth() + 1);
                    const cellDay = (cellDate.getDate() < 10 ? '0' : '') + cellDate.getDate();
                    const formattedCellDate = `${cellYear}-${cellMonth}-${cellDay}`;

                    if (year < currentYear ||
                        (year === currentYear && month < currentMonth) ||
                        (year === currentYear && month === currentMonth && dayCounter < currentDay)) {
                        cell.classList.add('unavailable');
                    } else if (bookedDates.includes(formattedCellDate)) {
                        cell.classList.add('unavailable');
                    } else {
                        cell.classList.add('available');
                    }
                    dayCounter++;
                    daysInRow++;
                }
            }
            table.appendChild(row);
            if (dayCounter > daysInMonth) {
                rowCount = i + 1; // Count the actual number of data rows
                break;
            } else {
                rowCount = i + 1;
            }
        }

        // Add empty rows if the calendar has less than 6 data rows
        while (rowCount < 6) {
            const emptyRow = table.insertRow();
            for (let i = 0; i < 7; i++) {
                emptyRow.insertCell().textContent = 'z';
            }
            rowCount++;
        }

        calendarDiv.appendChild(table);
    }

    prevButton.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(currentYear, currentMonth);
    });

    nextButton.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(currentYear, currentMonth);
    });

    fetchAvailability();
});