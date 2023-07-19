export type AhjsGetResDto = {
  pageSize: number;
  totalCount: number;
  totalPage: number;
  items: {
    geoId: string;
    name: string;
    fullAhjName: string;
    modifiedBy: string | null;
    modifiedAt: string | null;
    createdAt: string | null;
  }[];
};
