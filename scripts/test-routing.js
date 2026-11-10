import assert from 'node:assert';
import { STEP_TO_PATH, PATH_TO_STEP, RESERVED_ROUTES } from '../src/utils/routes.js';
import { getRouteSEO } from '../src/utils/seo.js';

console.log('--- TESTING DEDICATED ONBOARDING PAGE ROUTES ---');

// 1. Verify STEP_TO_PATH mappings
assert.strictEqual(STEP_TO_PATH['blueprint'], '/blueprint');
assert.strictEqual(STEP_TO_PATH['preview'], '/preview');
assert.strictEqual(STEP_TO_PATH['analyzing'], '/analyzing');
assert.strictEqual(STEP_TO_PATH['building'], '/building');
assert.strictEqual(STEP_TO_PATH['pre-finish'], '/pre-finish');
assert.strictEqual(STEP_TO_PATH['celebration'], '/celebration');
assert.strictEqual(STEP_TO_PATH['login'], '/login');
assert.strictEqual(STEP_TO_PATH['signup'], '/signup');
console.log('✓ STEP_TO_PATH maps all steps to dedicated paths');

// 2. Verify PATH_TO_STEP reverse mappings
assert.strictEqual(PATH_TO_STEP['/blueprint'], 'blueprint');
assert.strictEqual(PATH_TO_STEP['/preview'], 'preview');
assert.strictEqual(PATH_TO_STEP['/analyzing'], 'analyzing');
assert.strictEqual(PATH_TO_STEP['/building'], 'building');
assert.strictEqual(PATH_TO_STEP['/pre-finish'], 'pre-finish');
assert.strictEqual(PATH_TO_STEP['/celebration'], 'celebration');
assert.strictEqual(PATH_TO_STEP['/login'], 'login');
assert.strictEqual(PATH_TO_STEP['/signup'], 'signup');
console.log('✓ PATH_TO_STEP resolves all dedicated paths to steps');

// 3. Verify RESERVED_ROUTES contains all onboarding routes
['blueprint', 'preview', 'analyzing', 'building', 'pre-finish', 'celebration'].forEach(r => {
  assert.ok(RESERVED_ROUTES.includes(r), `RESERVED_ROUTES should contain ${r}`);
});
console.log('✓ RESERVED_ROUTES contains all dedicated onboarding page paths');

// 4. Test SEO resolver for /blueprint and /preview
const blueprintSEO = getRouteSEO('/blueprint');
assert.ok(blueprintSEO.title.includes('Blueprint'), `Title should mention Blueprint: ${blueprintSEO.title}`);

const previewSEO = getRouteSEO('/preview');
assert.ok(previewSEO.title.includes('Preview'), `Title should mention Preview: ${previewSEO.title}`);

console.log('✓ SEO route titles accurately resolve for /blueprint and /preview');
console.log('ALL ROUTING TESTS PASSED SUCCESSFULLY!');
