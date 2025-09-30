import SHACLValidator from 'rdf-validate-shacl';
import { Parser, Store } from 'n3';

// Utility to load SHACL shapes from local .ttl files
export async function loadShapes(shapeFiles) {
  const shapesStore = new Store();
  console.log('[SHACL] Loading SHACL shape files:', shapeFiles);
  for (const file of shapeFiles) {
    try {
      console.log(`[SHACL] Fetching shape file: ${file}`);
      const response = await fetch(file);
      const ttl = await response.text();
      console.log(`[SHACL] Shape file loaded (${file}), length: ${ttl.length}`);
      const parser = new Parser();
      shapesStore.addQuads(parser.parse(ttl));
    } catch (err) {
      console.error(`[SHACL] Error loading shape file ${file}:`, err);
      throw err;
    }
  }
  console.log('[SHACL] All shapes loaded, quads:', shapesStore.size);
  return shapesStore;
}

// Utility to fetch Turtle data from a URI
export async function fetchTurtle(uri) {
  console.log(`[SHACL] Fetching Turtle data from URI: ${uri}`);
  const response = await fetch(uri);
  const text = await response.text();
  console.log(`[SHACL] Turtle data loaded from ${uri}, length: ${text.length}`);
  return text;
}

// Validate Turtle data against SHACL shapes
export async function validateTurtle(turtleText, shapesStore) {
  console.log('[SHACL] Validating Turtle data against SHACL shapes...');
  const dataStore = new Store();
  const parser = new Parser();
  dataStore.addQuads(parser.parse(turtleText));
  console.log('[SHACL] Data quads:', dataStore.size);
  // Pass an empty importGraph to avoid owl:imports error
  const validator = new SHACLValidator(shapesStore, { importGraph: () => new Store() });
  const report = await validator.validate(dataStore);
  console.log('[SHACL] Validation report:', report);
  return report;
}
