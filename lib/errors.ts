export class RoleError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
