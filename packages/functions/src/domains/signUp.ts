export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
}

export interface SignUpResponse {
  id: string;
  email: string;
  name: string;
}
