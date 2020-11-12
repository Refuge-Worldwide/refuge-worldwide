interface DataResponse {
  data: {
    string: object;
  };
}

export const extractPage = (data: DataResponse, key: string) =>
  data?.data?.[key];
