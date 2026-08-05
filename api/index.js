import serverless from 'serverless-http';
import app from './generate-grocery.js';

export default serverless(app);
