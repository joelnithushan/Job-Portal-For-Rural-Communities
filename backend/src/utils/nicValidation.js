const validateSriLankanNIC = (nic) => {
    if (!nic) return null;
    const trimmedNic = String(nic).trim();

    // Check old and new formats
    const oldFormat = /^[0-9]{9}[vVxX]$/;
    const newFormat = /^[0-9]{12}$/;

    if (!oldFormat.test(trimmedNic) && !newFormat.test(trimmedNic)) {
        return null;
    }

    let year, days;
    if (trimmedNic.length === 10) {
        year = 1900 + parseInt(trimmedNic.substring(0, 2));
        days = parseInt(trimmedNic.substring(2, 5));
    } else {
        year = parseInt(trimmedNic.substring(0, 4));
        days = parseInt(trimmedNic.substring(4, 7));
    }

    let gender = 'MALE';
    if (days > 500) {
        gender = 'FEMALE';
        days -= 500;
    }

    if (days < 1 || days > 366) {
        return null; // Invalid days
    }

    // Sri Lankan NICs encode day-of-year as if every year has 366 days
    // (Feb 29 is always counted). For non-leap years, days after Feb 29
    // are shifted by 1 and must be decremented to get the real date.
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    if (!isLeapYear) {
        if (days === 60) {
            return null; // Feb 29 in a non-leap year is invalid
        }
        if (days > 60) {
            days -= 1;
        }
    }

    // Jan 1 = 1. JS Date is 0-indexed for month, days are 1-indexed.
    const dob = new Date(Date.UTC(year, 0, 1));
    dob.setUTCDate(dob.getUTCDate() + days - 1);

    return { gender, dob };
};

module.exports = {
    validateSriLankanNIC
};
