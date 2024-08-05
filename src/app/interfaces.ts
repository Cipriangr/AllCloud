import { DBSchema } from 'idb';

export interface ContactType {
  id: number;
  lastName: string;
  email: string;
  firstName: string;
  title: string;
  age: number;
  large: string;
  medium: string;
  thumbnail: string;
  gender: string;
  phone: string;
}

export interface ApiResponseType {
  info: {
    seed: string;
    results: number;
    page: number;
    version: string;
  };
  results: FetchedContactType[]
}

export interface FetchedContactType {
  cell?: string;
  dob: {
    age: number;
    date?: string;
  };
  email: string;
  gender: string;
  id: {
    name: string;
    value: string;
  };
  location?: {
    city: string;
    coordinates: {
      latitude: string;
      longitude: string;
    };
    country: string;
    postcode: number;
    state: string;
    street: {
      number: number;
      name: string;
    };
    timezone: {
      offset: string;
      description: string;
    };
  };
  login?: {
    md5: string;
    password: string;
    salt: string;
    sha1: string;
    sha256: string;
    username: string;
    uuid: string;
  };
  name: {
    first: string;
    last: string;
    title: string;
  };
  nat?: string;
  phone: string;
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  registered?: {
    age: number;
    date: string;
  };
}

export interface ContactsState {
  contacts: ContactType[];
  successMessage: string | null;
  errorMessage: string | null;
}

export interface ContactFormData {
  age: number,
  email: string,
  firstName: string,
  lastName: string,
  gender: string,
  phone: string,
  image: string | undefined
}

export interface ErrorResponse {
  error: string;
}

export enum StatusMessage {
  online = 'Connection restored! Your pending requests are now being processed.',
  offline = 'You are offline. Your future requests will be processed when you will be back online.'
}

export interface RequestSchema extends DBSchema {
  requests: {
    key: number;
    value: RequestPayload;
  };
}

export interface RequestPayload {
  type: RequestType;
  payload: ContactType | ContactType[] | number | string;
}

export enum RequestType {
  addMultipleContacts = 'addContacts',
  deleteContact = 'deleteContact',
  addSingleContact = 'addContact',
  updateContact = 'updateContact'
}