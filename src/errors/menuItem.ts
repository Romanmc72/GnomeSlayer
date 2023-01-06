export default class MenuItemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MenuItemError';
  }
}
