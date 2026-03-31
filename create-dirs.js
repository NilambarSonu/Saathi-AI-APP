const fs = require('fs');
const path = require('path');

const dirs = [
  'src/features/auth/services/',
  'src/features/hardware_ble/hooks/',
  'src/features/hardware_ble/services/',
  'src/features/hardware_ble/components/',
  'src/features/soil_analysis/hooks/',
  'src/features/soil_analysis/services/',
  'src/features/soil_analysis/components/',
  'src/features/ai_assistant/hooks/',
  'src/features/ai_assistant/services/',
  'src/features/ai_assistant/components/',
  'src/core/services/',
  'src/shared/components/'
];

dirs.forEach(dir => {
  fs.mkdirSync(dir, { recursive: true });
  console.log('✓ Created:', dir);
});

console.log('\nAll directories created successfully!');
