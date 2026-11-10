/**
 * routes.js
 *
 * Dedicated route constants and step-to-path mappings for CoLaunch onboarding.
 */

export const STEPS = [
  'welcome',
  'creator-link',
  'analyzing',
  'blueprint',
  'preview',
  'building',
  'pre-finish',
  'celebration',
  'signup',
  'login',
  'dashboard',
];

export const STEP_TO_PATH = {
  'welcome': '/portal',
  'creator-link': '/portal',
  'analyzing': '/analyzing',
  'blueprint': '/blueprint',
  'preview': '/preview',
  'building': '/building',
  'pre-finish': '/pre-finish',
  'celebration': '/celebration',
  'login': '/login',
  'signup': '/signup',
};

export const PATH_TO_STEP = {
  '/analyzing': 'analyzing',
  '/blueprint': 'blueprint',
  '/preview': 'preview',
  '/building': 'building',
  '/pre-finish': 'pre-finish',
  '/celebration': 'celebration',
  '/creator-link': 'creator-link',
  '/onboarding': 'creator-link',
  '/login': 'login',
  '/signup': 'signup',
};

export const RESERVED_ROUTES = [
  'join', 'portal', 'co-launch', 'preorder', 'beta', 'survey', 'research',
  'follow-up-crm', 'crm', 'admin-error-log', 'error-log', 'errors',
  'project-os', 'projects', 'project', 'participation-manager', 'co-builders',
  'cobuilder-admin', 'participation', 'launch', 'creator-launch', 'ops',
  'dashboard', 'login', 'signup', 'api', 'static', 'member',
  'blueprint', 'preview', 'analyzing', 'building', 'pre-finish', 'celebration',
  'creator-link', 'onboarding'
];

