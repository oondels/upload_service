export class Application {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly folderName: string,
    public readonly isActive: boolean,
    public readonly createdAt: Date
  ) {}
}
