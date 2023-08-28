function daysBetweenDates(start, end) {
  const oneDay = 24 * 60 * 60 * 1000; // Hours, minutes, seconds, milliseconds
  return Math.round((end - start) / oneDay);
}

function getAnkyverseDay(date) {
  const ankyverseStart = new Date('2023-08-10T05:00:00-04:00');
  const daysInSojourn = 96;
  const daysInSlumber = 21;
  const cycleLength = daysInSojourn + daysInSlumber; // 117 days
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

  const elapsedDays = daysBetweenDates(ankyverseStart, date);
  const currentSojourn = Math.floor(elapsedDays / cycleLength) + 1;
  const dayWithinCurrentCycle = elapsedDays % cycleLength;

  let currentKingdom, status, wink;
  if (dayWithinCurrentCycle < daysInSojourn) {
    status = 'Sojourn';
    wink = dayWithinCurrentCycle + 1; // Wink starts from 1
    currentKingdom = kingdoms[dayWithinCurrentCycle % 8];
  } else {
    status = 'Great Slumber';
    wink = null; // No Wink during the Great Slumber
    currentKingdom = 'None';
  }

  return {
    date: date.toISOString(),
    currentSojourn,
    status,
    currentKingdom,
    wink,
  };
}

// Example: What is the Ankyverse day on January 29, 2040?
const exampleDate = new Date('2040-01-29T05:00:00-04:00');
console.log(getAnkyverseDay(exampleDate));
