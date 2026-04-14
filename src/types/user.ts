export interface UserAddress {
  street?: string;
  number?: number;
  neighborhood?: string;
  complement?: string;
  city?: string;
  uf?: string;
  zipCode?: string;
}

export interface UserData {
  _id: string;
  name?: string;
  email?: string;
  cpf?: string;
  phone?: number; 
  birthDate?: string;
  sex?: 'M' | 'F'; 
  role?: 'user' | 'admin';
  avatar?: string | null;
  token?: string;
  address?: UserAddress;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}