export const centsToDollarString = (cents: number) => (cents / 100).toFixed(2);

export const dollarStringToCentsString = (dollarString: string) => dollarString.replace(".", "");
