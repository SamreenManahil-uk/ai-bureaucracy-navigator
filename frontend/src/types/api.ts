export type HealthResponse = {
  status: string;
  service: string;
};

export type DocumentItem = {
  _id: string;
  filename: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};
