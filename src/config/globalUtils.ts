import { monthNames } from "./config";

const controlKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'];
export const restrictAlphabets = (
  e: KeyboardEvent,
  ref: any,
  isMobile?: boolean | undefined
) => {
  const mobile = isMobile == undefined ? false : isMobile;
  const startDigit = ['6', '7', '8', '9'];

  const inputValue = ref.current.value;

  const isDigit = /^[0-9]$/.test(e.key);

  let predictedValue = inputValue;
  if (isDigit) {
    predictedValue += e.key;
  } else if (e.key === 'Backspace' && inputValue?.length > 0) {
    predictedValue = inputValue.slice(0, -1);
  }

  if (
    (!isDigit && !controlKeys.includes(e.key)) ||
    (mobile == true &&
      predictedValue?.length === 1 &&
      !startDigit.includes(predictedValue[0]))
  ) {
    e.preventDefault();
  }
};

export const restrictDigits = (e: KeyboardEvent) => {
  var char = e.key;
  if (/^[a-zA-Z\s]$/.test(char) || controlKeys.includes(e.code)) {
    return true;
  }
  return e.preventDefault();
};





export const handleLimitLength = (e: KeyboardEvent, ref: any, limit: number) => {
  const inputValue = ref.current.value;
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  if (e.key === 'Backspace') {
    // Allow backspace
    return;
  }

  if (digits.includes(e.key)) {
    if (inputValue.length >= limit) {
      // Prevent further input if limit is reached
      e.preventDefault();
    }
  } else {
    // Prevent non-digit input
    e.preventDefault();
  }
};

export const handleAlphaNumericLimitLength = (e: KeyboardEvent, ref: any, limit: number) => {
  const inputValue = ref.current.value;
  const alphanumericPattern = /^[a-zA-Z0-9]$/;

  if (e.key === 'Backspace') {
    return;
  }

  if (alphanumericPattern.test(e.key)) {
    if (inputValue.length >= limit) {
      e.preventDefault();
    }
  } else {
    e.preventDefault();
  }
};


export const handleCopyPaste = (event: any) => {
  event.preventDefault();
};


export const restrictSpecialCharacters = (e: KeyboardEvent) => {
  const specialCharRegex = /^[^!`~@#$%^&*()+=_\-[\]';,./{}|\\":<>?]*$/;
  if (!specialCharRegex.test(e.key) && !controlKeys.includes(e.key)) {
    e.preventDefault();
  }
};

export const restrictSpecialCharactersExceptHyphen = (e: KeyboardEvent) => {
  const specialCharRegex = /^[^!`~@#$%^&*()+=_\[\]';,./{}|\\":<>?]*$/;
  if ((!specialCharRegex.test(e.key) && !controlKeys.includes(e.key)) || e.key === 'Enter') {
    e.preventDefault();
  }
};

export const restrictSpecialCharactersForSchool = (e: KeyboardEvent) => {
  const specialCharRegex = /^[^!`~@#$%^&*()+=_\-[\]';,/{}|\\":<>?]*$/;
  if (!specialCharRegex.test(e.key) && !controlKeys.includes(e.key)) {
    e.preventDefault();
  }
};

export function getSerialNumber(index: number, pageNumber: number, itemsPerPage: number) {
  return (pageNumber - 1) * itemsPerPage + (index + 1);
}

export const CapitalizedFunction = (data: string) => {
  if(data == null) {
    return;
  }
  const words = data.split(' ');
  const capitalised = words.map(
    (word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );
  return capitalised.join(' ');
};


export const DateFormatFunction = (data:string) => {
  const ddmmyyyyPattern = /^\d{2}-\d{2}-\d{4}$/;
  const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  let formatCorrection = '';
  if (ddmmyyyyPattern.test(data)) {
    const dateInfo = data.split('-');
    const day = dateInfo[0];
    const monthIndex = parseInt(dateInfo[1]) - 1;
    const year = dateInfo[2];
    formatCorrection = `${day}-${monthNames[monthIndex]}-${year}`;
    return formatCorrection;
  
  } else if (isoPattern.test(data)) {
    const date = new Date(data);

    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const formattedDay = day < 10 ? `0${day}` : `${day}`;
    const formattedMonth = month < 9 ? `0${month + 1}` : `${month + 1}`;
    
    formatCorrection = `${formattedDay}-${monthNames[month]}-${year}`;
    return formatCorrection;

  } else {
    throw new Error('Invalid date format');
  }
}

export const maskFunction = (first: number, last: number, element: any) => {
  
  const visibleStart = element.slice(0, first);
  const visibleEnd = element.slice(-last);
  const maskedMiddle = 'X'.repeat(element.length - first - last);  
  const maskedElement = `${visibleStart}${maskedMiddle}${visibleEnd}`;

  return maskedElement;
};

export const formatDate = (date:any) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}/${month}/${day}`;
};

export const formatDateAsString = (date:any) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`; // Format as 'yyyy-mm-dd'
};

export const convertToISOString = (dateString:any) => {
  const date = new Date(`${dateString}T18:30:00.000Z`);
  return date.toISOString();
};
export const restrictSpecialCharactersForEmail = (e: KeyboardEvent) => {
  const allowedCharRegex = /^[a-zA-Z0-9@._%+-]*$/;
  if (!allowedCharRegex.test(e.key) && !controlKeys.includes(e.key)) {
    e.preventDefault();
  }
};
export const restrictSpecialCharactersForUnivCode = (e: KeyboardEvent) => {
  const allowedCharRegex = /^[a-zA-Z0-9_-]*$/;
  if (!allowedCharRegex.test(e.key) && !controlKeys.includes(e.key)) {
    e.preventDefault();
  }
};

export const getSafeValue = (obj: any, key: number) => {
  const val = obj?.[key];
  return val === null || val === '' || val?.toString() === '' ? 0 : val;
};