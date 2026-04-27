/**
 * Sri Lankan NIC Validation Utility (Frontend)
 * Parses old (9-digit + V/X) and new (12-digit) NIC formats
 * to extract gender and date of birth.
 */
export const parseSriLankanNIC = (nic) => {
    if (!nic) return null;
    const trimmed = String(nic).trim();

    const oldFormat = /^[0-9]{9}[vVxX]$/;
    const newFormat = /^[0-9]{12}$/;

    if (!oldFormat.test(trimmed) && !newFormat.test(trimmed)) {
        return null;
    }

    let year, days;
    if (trimmed.length === 10) {
        year = 1900 + parseInt(trimmed.substring(0, 2));
        days = parseInt(trimmed.substring(2, 5));
    } else {
        year = parseInt(trimmed.substring(0, 4));
        days = parseInt(trimmed.substring(4, 7));
    }

    let gender = 'MALE';
    if (days > 500) {
        gender = 'FEMALE';
        days -= 500;
    }

    if (days < 1 || days > 366) {
        return null;
    }

    const dob = new Date(Date.UTC(year, 0, 1));
    dob.setUTCDate(dob.getUTCDate() + days - 1);

    return { gender, dob };
};
