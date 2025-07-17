import express from 'express';
import { supabase } from './supabase.js';

const app = express();
const port = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send('Hello from the API!');
});

app.get('/test', async (req, res) => {
  const { data, error } = await supabase.from('test').select('*');
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
