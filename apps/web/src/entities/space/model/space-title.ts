export const maxTitleLength = 80;

export const titleError = (title: string) => {
  if (!title.trim()) return 'Введите название пространства';
  if (title.length > maxTitleLength) return `Не длиннее ${maxTitleLength} символов`;
  return null;
};
