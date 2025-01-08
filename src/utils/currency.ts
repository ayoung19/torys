export const centsToDollarString = (cents: number) => (cents / 100).toFixed(2);

export const dollarStringToCents = (dollarString: string) => dollarString.replace(".", "");
