const { validateSriLankanNIC } = require('../src/utils/nicValidation');

const cases = [
  // [nic, expectedDob, expectedGender, note]
  ['200228002211', '2002-10-06', 'MALE',   'user case, non-leap year, after Feb 29'],
  ['200000100018', '2000-01-01', 'MALE',   'leap year, Jan 1 (day 1)'],
  ['200006000019', '2000-02-29', 'MALE',   'leap year, Feb 29 (day 60)'],
  ['200006100016', '2000-03-01', 'MALE',   'leap year, Mar 1 (day 61)'],
  ['200236600015', '2002-12-31', 'MALE',   'non-leap, last day (day 366 -> Dec 31)'],
  ['200278000010', '2002-10-06', 'FEMALE', 'female: days = 500 + 280, non-leap'],
  ['200006000060', '2000-02-29', 'MALE',   'leap year day 60 = Feb 29 valid'],
  ['200206000010', null,         null,     'non-leap day 60 must be invalid (no Feb 29)'],
  ['199931200012', '1999-11-07', 'MALE',   'non-leap 1999 day 312 -> Nov 7'],
  ['200431200013', '2004-11-07', 'MALE',   'leap 2004 day 312 -> Nov 7'],
  ['199636600014', '1996-12-31', 'MALE',   'leap 1996 day 366 -> Dec 31'],
];

for (const [nic, expDob, expGender, note] of cases) {
  const r = validateSriLankanNIC(nic);
  const got = r ? r.dob.toISOString().split('T')[0] : null;
  const gender = r ? r.gender : null;
  const ok = got === expDob && gender === expGender;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${nic} => ${got}/${gender} (expected ${expDob}/${expGender}) — ${note}`);
}
