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

    // Days offset
    // Jan 1 = 1. JS Date is 0-indexed for month, days are 1-indexed.
    // Easiest is to set Date to Jan 1st of that year, and add (days - 1) days.
    const dob = new Date(Date.UTC(year, 0, 1));
    dob.setUTCDate(dob.getUTCDate() + days - 1);

    return { gender, dob };
};

module.exports = {
    validateSriLankanNIC
};
