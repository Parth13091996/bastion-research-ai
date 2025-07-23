import HomePage from './HomePage';
import PageNotFound from './page-not-found';
import PreviewPage from './preview';
import { AppRoutes } from './routes-config';
import ViewPage from './view';
import { RouteObject } from 'react-router-dom';

interface Route {
  path: string;
  Component: React.ComponentType;
  index?: boolean;
}

export const routes: Route[] = [
  { Component: HomePage, index: true, path: AppRoutes.home() },
  { Component: PreviewPage, path: AppRoutes.preview() },
  { Component: ViewPage, path: AppRoutes.view() },
  { Component: PageNotFound, path: AppRoutes.pageNotFound() },
];
