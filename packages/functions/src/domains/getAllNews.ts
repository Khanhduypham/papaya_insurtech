export interface GetAllNewsRequest {
  search?: string;
  filters?: Filter[];
  offset?: number;
  limit?: number;
}

export interface Filter {
  name: string;
  values: [string];
}
