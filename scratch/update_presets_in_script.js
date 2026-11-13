const fs = require('fs');

let content = fs.readFileSync('script.js', 'utf8');

// Update kitchen modern-grey surfaces
content = content.replace(
  `          surfaces: {
            'kitchen-upper': { color: '#B5AEA4', opacity: 0.8 },
            'kitchen-lower': { color: '#2B2F34', opacity: 0.88 },
            'kitchen-counter': { color: '#24282C', opacity: 0.75 },
            'kitchen-backsplash': { color: '#3A3F45', opacity: 0.8 }
          }`,
  `          surfaces: {
            'kitchen-upper': { color: '#B5AEA4', opacity: 0.8 },
            'kitchen-lower': { color: '#2B2F34', opacity: 0.88 }
          }`
);

// Update kitchen sage-green surfaces
content = content.replace(
  `          surfaces: {
            'kitchen-upper': { color: '#8E9F7F', opacity: 0.82 },
            'kitchen-backsplash': { color: '#93A585', opacity: 0.65 }
          }`,
  `          surfaces: {
            'kitchen-upper': { color: '#8E9F7F', opacity: 0.82 }
          }`
);

// Update kitchen royal-blue surfaces
content = content.replace(
  `          surfaces: {
            'kitchen-lower': { color: '#152A42', opacity: 0.88 },
            'kitchen-backsplash': { color: '#D0AB68', opacity: 0.6 }
          }`,
  `          surfaces: {
            'kitchen-lower': { color: '#152A42', opacity: 0.88 }
          }`
);

// Update kitchen terracotta surfaces
content = content.replace(
  `          surfaces: {
            'kitchen-upper': { color: '#C59B4B', opacity: 0.75 },
            'kitchen-lower': { color: '#343A40', opacity: 0.82 },
            'kitchen-counter': { color: '#D6C7B2', opacity: 0.65 }
          }`,
  `          surfaces: {
            'kitchen-upper': { color: '#C59B4B', opacity: 0.75 },
            'kitchen-lower': { color: '#343A40', opacity: 0.82 }
          }`
);

// Update living modern-grey surfaces
content = content.replace(
  `          surfaces: {
            'living-sofa': { color: '#6E7781', opacity: 0.82 },
            'living-accent': { color: '#3A3530', opacity: 0.85 },
            'living-curtains': { color: '#7C848C', opacity: 0.65 }
          }`,
  `          surfaces: {
            'living-sofa': { color: '#6E7781', opacity: 0.82 },
            'living-accent': { color: '#3A3530', opacity: 0.85 }
          }`
);

// Update living sage-green surfaces
content = content.replace(
  `          surfaces: {
            'living-sofa': { color: '#8E9F7F', opacity: 0.82 },
            'living-walls': { color: '#8E9F7F', opacity: 0.65 },
            'living-curtains': { color: '#839276', opacity: 0.6 }
          }`,
  `          surfaces: {
            'living-sofa': { color: '#8E9F7F', opacity: 0.82 }
          }`
);

// Update living royal-blue surfaces
content = content.replace(
  `          surfaces: {
            'living-sofa': { color: '#182C45', opacity: 0.88 },
            'living-curtains': { color: '#182C45', opacity: 0.7 },
            'living-accent': { color: '#6A4932', opacity: 0.75 }
          }`,
  `          surfaces: {
            'living-sofa': { color: '#182C45', opacity: 0.88 },
            'living-accent': { color: '#5A3825', opacity: 0.75 }
          }`
);

// Update living terracotta surfaces
content = content.replace(
  `          surfaces: {
            'living-sofa': { color: '#C26D53', opacity: 0.82 },
            'living-walls': { color: '#C26D53', opacity: 0.65 }
          }`,
  `          surfaces: {
            'living-sofa': { color: '#C26D53', opacity: 0.82 }
          }`
);

fs.writeFileSync('script.js', content, 'utf8');
console.log('Successfully updated STUDIO_DATA in script.js');

