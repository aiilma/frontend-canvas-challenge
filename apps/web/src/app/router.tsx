import { createBrowserRouter } from 'react-router';

import { SpacePage } from '@/pages/space';
import { SpacesPage } from '@/pages/spaces';

import { RootLayout } from './ui/RootLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [{ index: true, Component: SpacesPage }],
  },
  { path: '/spaces/:spaceId', Component: SpacePage },
]);
