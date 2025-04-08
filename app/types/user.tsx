export interface User {
  userID: number;
  userName: string;
  email: string;
  fullname: string;
  phone: string;
  address: string;
  createdDate: string;
  avatar: string;
  gender: number;
  dateOfBirth: string;
  role: number;
}

export interface UserAll {
  id: number;
  username: string;
  email: string;
  phone: string;
  address: string;
  role: number;
  avatar: string;
  dateOfBirth: string;
  gender: number;
}