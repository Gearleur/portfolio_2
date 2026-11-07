// French typography: a narrow no-break space keeps « 20 % » on one line.
export const percent = (value: number) => `${Math.round(value * 100)}\u202f%`;
export const ratio = (value: number) => `${value.toFixed(1).replace('.', ',')}:1`;
