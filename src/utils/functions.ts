export const sleep = (ms: number) => new Promise(resolve => setTimeout(() => resolve(true), ms));

export const phoneNumberUtils = {
  format(raw: string) {
    const onlyNumbers = raw.replace(/\D/g, '');
    const formatted = (onlyNumbers.match(/.{1,3}/g)?.join(' ') || '').slice(0, 11);
    return formatted;
  },
  clean(raw: string) {
    const cleaned = raw.replace(/\D/g, '').replace(/\s+/g, '');
    return cleaned;
  },
  valid(raw: string) {
    const val = this.clean(raw);
    return val.length === 9;
  },
};
