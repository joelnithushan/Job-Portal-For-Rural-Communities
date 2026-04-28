const { validateSriLankanNIC } = require('../src/utils/nicValidation');

const nic = '200228002211';
const nicInfo = validateSriLankanNIC(nic);
console.log('NIC:', nic);
console.log('NIC parse result:', nicInfo);

const tests = ['2002-10-06', '2002-10-07', '06/10/2002'];

if (!nicInfo) process.exit(1);

const nicDob = new Date(nicInfo.dob);
console.log('NIC-derived DOB (ISO):', nicDob.toISOString().split('T')[0]);

for (const s of tests) {
  const d = new Date(s);
  console.log('---');
  console.log('Input string:', s);
  console.log('Parsed date ISO:', isNaN(d.getTime()) ? 'Invalid Date' : d.toISOString());
  if (!isNaN(d.getTime())) {
    const matchesUTC = d.getUTCFullYear() === nicDob.getUTCFullYear()
      && d.getUTCMonth() === nicDob.getUTCMonth()
      && d.getUTCDate() === nicDob.getUTCDate();

    console.log('Matches NIC DOB (UTC comparison)?', matchesUTC);
  }
}
