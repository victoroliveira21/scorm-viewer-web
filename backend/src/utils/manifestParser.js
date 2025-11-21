import { XMLParser } from 'fast-xml-parser';
import fs from 'fs/promises';
import path from 'path';

/**
 * Find and read the imsmanifest.xml file
 * Ported from app.js findManifest()
 * @param {string} scormDir - Path to extracted SCORM directory
 * @returns {Promise<string>} Manifest XML content
 */
export async function findManifest(scormDir) {
  const manifestPatterns = ['imsmanifest.xml', 'IMSMANIFEST.XML'];

  // Try root directory first
  for (const pattern of manifestPatterns) {
    const manifestPath = path.join(scormDir, pattern);
    try {
      const content = await fs.readFile(manifestPath, 'utf-8');
      return content;
    } catch (error) {
      // File not found, continue
    }
  }

  // Search in subdirectories
  const files = await fs.readdir(scormDir, { recursive: true });
  for (const file of files) {
    if (file.toLowerCase().endsWith('imsmanifest.xml')) {
      const manifestPath = path.join(scormDir, file);
      const content = await fs.readFile(manifestPath, 'utf-8');
      return content;
    }
  }

  throw new Error('imsmanifest.xml not found in SCORM package');
}

/**
 * Parse SCORM manifest and extract metadata
 * Ported from app.js parseManifest()
 * @param {string} xmlString - Manifest XML content
 * @param {string} scormDir - Path to extracted SCORM directory (for file validation)
 * @returns {Promise<object>} Parsed manifest data
 */
export async function parseManifest(xmlString, scormDir) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseAttributeValue: true,
    trimValues: true
  });

  const xmlDoc = parser.parse(xmlString);

  if (!xmlDoc.manifest) {
    throw new Error('Invalid SCORM manifest: missing <manifest> element');
  }

  const manifest = xmlDoc.manifest;

  // Extract title
  let title = 'SCORM Package';
  if (manifest.metadata && manifest.metadata.lom && manifest.metadata.lom.general && manifest.metadata.lom.general.title) {
    title = manifest.metadata.lom.general.title.langstring || title;
  } else if (manifest.organizations && manifest.organizations.organization) {
    const org = Array.isArray(manifest.organizations.organization)
      ? manifest.organizations.organization[0]
      : manifest.organizations.organization;
    if (org['@_title']) {
      title = org['@_title'];
    }
  }

  // Extract entry point using multiple strategies
  let entryPoint = null;

  // Strategy 1: First item in default organization
  if (manifest.organizations && manifest.organizations.organization) {
    const org = Array.isArray(manifest.organizations.organization)
      ? manifest.organizations.organization[0]
      : manifest.organizations.organization;

    if (org.item) {
      const firstItem = Array.isArray(org.item) ? org.item[0] : org.item;
      const identifierref = firstItem['@_identifierref'];

      if (identifierref && manifest.resources && manifest.resources.resource) {
        const resources = Array.isArray(manifest.resources.resource)
          ? manifest.resources.resource
          : [manifest.resources.resource];

        const resource = resources.find(r => r['@_identifier'] === identifierref);

        if (resource && resource['@_href']) {
          entryPoint = resource['@_href'];
        }
      }
    }
  }

  // Strategy 2: First resource with href
  if (!entryPoint && manifest.resources && manifest.resources.resource) {
    const resources = Array.isArray(manifest.resources.resource)
      ? manifest.resources.resource
      : [manifest.resources.resource];

    const resourceWithHref = resources.find(r => r['@_href']);
    if (resourceWithHref) {
      entryPoint = resourceWithHref['@_href'];
    }
  }

  // Strategy 3: Common entry points
  if (!entryPoint) {
    const commonEntryPoints = ['index.html', 'index.htm', 'launch.html', 'scorm.html'];

    for (const ep of commonEntryPoints) {
      const filePath = path.join(scormDir, ep);
      try {
        await fs.access(filePath);
        entryPoint = ep;
        break;
      } catch (error) {
        // File doesn't exist, continue
      }
    }
  }

  if (!entryPoint) {
    throw new Error('Entry point not found in SCORM manifest');
  }

  // Detect SCORM version
  let version = 'unknown';
  const schemaversion = String(manifest['@_schemaversion'] || manifest.metadata?.schemaversion || '');

  if (schemaversion.includes('1.2')) {
    version = 'SCORM 1.2';
  } else if (schemaversion.includes('2004') || schemaversion.includes('1.3')) {
    version = 'SCORM 2004';
  } else if (manifest.metadata?.schema === 'ADL SCORM') {
    version = 'SCORM 1.2';
  }

  // Get list of all files in package
  const files = [];
  if (manifest.resources && manifest.resources.resource) {
    const resources = Array.isArray(manifest.resources.resource)
      ? manifest.resources.resource
      : [manifest.resources.resource];

    resources.forEach(resource => {
      if (resource.file) {
        const resourceFiles = Array.isArray(resource.file) ? resource.file : [resource.file];
        resourceFiles.forEach(file => {
          if (file['@_href']) {
            files.push(file['@_href']);
          }
        });
      }
    });
  }

  return {
    title,
    entryPoint,
    version,
    files,
    rawManifest: xmlDoc.manifest
  };
}

/**
 * Validate SCORM package structure
 * @param {string} scormDir - Path to extracted SCORM directory
 * @returns {Promise<object>} Validation result
 */
export async function validateScormPackage(scormDir) {
  const errors = [];
  const warnings = [];

  // Check if directory exists
  try {
    await fs.access(scormDir);
  } catch (error) {
    errors.push('SCORM directory not found');
    return { valid: false, errors, warnings };
  }

  // Check for manifest
  try {
    await findManifest(scormDir);
  } catch (error) {
    errors.push('imsmanifest.xml not found');
    return { valid: false, errors, warnings };
  }

  // Parse and validate manifest
  try {
    const manifestXml = await findManifest(scormDir);
    const manifest = await parseManifest(manifestXml, scormDir);

    // Check if entry point exists
    const entryPath = path.join(scormDir, manifest.entryPoint);
    try {
      await fs.access(entryPath);
    } catch (error) {
      errors.push(`Entry point file not found: ${manifest.entryPoint}`);
    }

    // Check version
    if (manifest.version === 'unknown') {
      warnings.push('SCORM version could not be determined');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      manifest
    };
  } catch (error) {
    errors.push(`Manifest parsing error: ${error.message}`);
    return { valid: false, errors, warnings };
  }
}
