

export interface IUser {
  _id: string;
  name: string;
  email: string;
  firebaseUID: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUserState {
  currentUser: IUser | null;
  users: IUser[];
  selectedUser: IUser | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
}

export interface IUpdateProfileData {
  name?: string;
  avatar?: string;
}

export interface IUpdateRoleData {
  id: string;
  role: 'user' | 'admin';
}

export interface IApiResponse {
  success: boolean;
  message?: string;
}

export interface IGetAllUsersResponse extends IApiResponse {
  count: number;
  users: IUser[];
}

export interface IGetUserResponse extends IApiResponse {
  user: IUser;
}

export interface IUpdateRoleResponse extends IApiResponse {
  user: IUser;
}