export const APP_ID = 'jusartificial';

export const getClientPath = (userId: string) =>
  `artifacts/${APP_ID}/users/${userId}/clients`;

export const getSessionPath = (userId: string) =>
  `artifacts/${APP_ID}/users/${userId}/sessions`;

export const getTemplatePath = (userId: string) =>
  `artifacts/${APP_ID}/users/${userId}/templates`;
