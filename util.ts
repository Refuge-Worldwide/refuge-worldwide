interface DataResponse {
  data: {
    string: object;
  };
}

export const extract = (data: DataResponse, key: string) => data?.data?.[key];
