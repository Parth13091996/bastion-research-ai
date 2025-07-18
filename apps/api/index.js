import express from 'express';
import cors from 'cors';
import { supabase } from './supabase.js';

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.json({ message: 'ok' });
});

app.get('/users', async (req, res) => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
});

app.post('/users', async (req, res) => {
    const { data, error } = await supabase.from('users').insert([req.body]);
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
});

app.put('/users/:id', async (req, res) => {
    const { data, error } = await supabase.from('users').update(req.body).eq('id', req.params.id);
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
});

app.delete('/users/:id', async (req, res) => {
    const { data, error } = await supabase.from('users').delete().eq('id', req.params.id);
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
