export const AppRoutes = {
  home: () => '/proposal/edit/:proposalId',
  pageNotFound: () => '/page-not-found',
  preview: (documentId?: string) =>
    `/proposal/preview/${documentId !== undefined ? documentId : ':documentId'}`,
  view: (documentId?: string) =>
    `/proposal/view/${documentId !== undefined ? documentId : ':hash'}`,
};
