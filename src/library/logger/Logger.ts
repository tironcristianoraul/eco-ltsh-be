export default abstract class Logger {
  static log = (message: string, color: (message: string) => void): void =>
    console.log(color(message));
}
