import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [
    react(), 
    viteSingleFile()
  ],
  build: {
    emptyOutDir: false, // So it doesn't wipe out the code.js file
  }
});
