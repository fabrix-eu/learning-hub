import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { RootLayout } from '../routes/root';
import { HubPage, type HubSearch } from '../routes/hub';
import { TopicPage } from '../routes/topic';
import { ToolsPage, type ToolsSearch } from '../routes/tools';
import { PartnersPage } from '../routes/partners';
import { PartnerPage } from '../routes/partner';
import { NotFoundPage } from '../routes/not-found';
import { Pending } from '../components/Pending';
import { categoriesQueryOptions, partnerQueryOptions, partnersQueryOptions, topicQueryOptions, topicsQueryOptions, toolsQueryOptions } from './directus';
import { queryClient } from './queryClient';

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
});

const hubRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: (search: Record<string, unknown>): HubSearch => ({
    for: search.for as HubSearch['for'],
    type: search.type as HubSearch['type'],
    cat: search.cat as string | undefined,
    q: (search.q as string) || undefined,
    media: search.media as HubSearch['media'],
  }),
  loader: () =>
    Promise.all([
      queryClient.ensureQueryData(topicsQueryOptions()),
      queryClient.ensureQueryData(categoriesQueryOptions()),
    ]),
  component: HubPage,
});

const topicRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/topics/$slug',
  loader: ({ params }) => queryClient.ensureQueryData(topicQueryOptions(params.slug)),
  component: TopicPage,
  errorComponent: NotFoundPage,
});

const toolsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tools',
  validateSearch: (search: Record<string, unknown>): ToolsSearch => ({ kind: search.kind as ToolsSearch['kind'] }),
  loader: () => queryClient.ensureQueryData(toolsQueryOptions()),
  component: ToolsPage,
});

const partnersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/partners',
  loader: () =>
    Promise.all([
      queryClient.ensureQueryData(partnersQueryOptions()),
      queryClient.ensureQueryData(topicsQueryOptions()),
    ]),
  component: PartnersPage,
});

const partnerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/partners/$key',
  loader: ({ params }) =>
    Promise.all([
      queryClient.ensureQueryData(partnerQueryOptions(params.key)),
      queryClient.ensureQueryData(topicsQueryOptions()),
    ]),
  component: PartnerPage,
  errorComponent: NotFoundPage,
});

const routeTree = rootRoute.addChildren([
  hubRoute,
  topicRoute,
  toolsRoute,
  partnersRoute,
  partnerRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPendingComponent: Pending,
  defaultPreload: 'intent',
  scrollRestoration: true,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
