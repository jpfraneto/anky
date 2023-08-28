// Calculates the number of days between two dates
function daysBetweenDates(start, end) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((end - start) / oneDay);
}

// Calculates the Kingdom and Sojourn for any given date
function getAnkyverseDay(date) {
  // Start of Ankyverse in Chilean time
  const ankyverseStart = new Date('2023-08-10T05:00:00-04:00');

  // Definitions
  const daysInSojourn = 96;
  const daysInSlumber = 21;
  const cycleLength = daysInSojourn + daysInSlumber; // 117
  const kingdoms = [
    'Primordia',
    'Emblazion',
    'Chryseos',
    'Eleasis',
    'Voxlumis',
    'Insightia',
    'Claridium',
    'Poiesis',
  ];

  // Calculate elapsed days since start
  const elapsedDays = daysBetweenDates(ankyverseStart, date);

  // Calculate current Sojourn and day within that Sojourn
  const currentSojourn = Math.floor(elapsedDays / cycleLength) + 1;
  const dayWithinCurrentCycle = elapsedDays % cycleLength;

  // Determine Kingdom and status (Sojourn or Slumber)
  let currentKingdom, status;
  if (dayWithinCurrentCycle < daysInSojourn) {
    status = 'Sojourn';
    currentKingdom = kingdoms[dayWithinCurrentCycle % 8];
  } else {
    status = 'Great Slumber';
    currentKingdom = 'None'; // Or however you'd like to represent this
  }

  return {
    date: date.toISOString(),
    currentSojourn,
    status,
    currentKingdom,
  };
}

// Example: What is the Ankyverse day on January 29, 2040?
const exampleDate = new Date();
console.log('today is', getAnkyverseDay(exampleDate));
