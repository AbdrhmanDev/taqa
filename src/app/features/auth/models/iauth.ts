export interface IAuth {}
export interface ILogin {
  email: string;
  password: string;
}
export interface Iverify {
  email: string | null;
}
export interface Iotp {
  email: string | null;
  otp: string | null;
}
export interface IresetPass {
  email: string | null;
  newPassword: string | null;
}
