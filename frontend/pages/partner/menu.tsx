import React, { useEffect, useMemo, useState } from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import Input from '@mui/material/Input';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import PartnerGuard from '../../src/components/partner/PartnerGuard';
import { useAuth } from '../../src/lib/AuthContext';

type Restaurant = { id: number; name: string; is_open: boolean };
type Category = { id: number; name: string; position: number };
type Item = { id: number; name: string; description: string | null; price_cents: number; is_available: boolean; category_id: number | null };

export default function PartnerMenuPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const { auth } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurantId, setRestaurantId] = useState<string>('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [items, setItems] = useState<Item[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [newItem, setNewItem] = useState<{ name: string; description: string; price: string }>({ name: '', description: '', price: '' });
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${auth.token}`
  }), [auth.token]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/partner/restaurants`, { headers });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load restaurants');
        setRestaurants(data.data || []);
        if ((data.data || []).length && !restaurantId) setRestaurantId(String(data.data[0].id));
      } catch (e) { setError(e instanceof Error ? e.message : 'Unexpected error'); }
    };
    load();
  }, [API_BASE_URL, headers]);

  useEffect(() => {
    if (!restaurantId) return;
    const loadCats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/partner/restaurants/${restaurantId}/categories`, { headers });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load categories');
        setCategories(data.data || []);
      } catch (e) { setError(e instanceof Error ? e.message : 'Unexpected error'); }
    };
    loadCats();
  }, [API_BASE_URL, headers, restaurantId]);

  useEffect(() => {
    if (!restaurantId) return;
    const loadItems = async () => {
      try {
        const query = selectedCategoryId ? `?categoryId=${selectedCategoryId}` : '';
        const res = await fetch(`${API_BASE_URL}/api/partner/restaurants/${restaurantId}/menu-items${query}`, { headers });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load items');
        setItems(data.data || []);
      } catch (e) { setError(e instanceof Error ? e.message : 'Unexpected error'); }
    };
    loadItems();
  }, [API_BASE_URL, headers, restaurantId, selectedCategoryId]);

  const addCategory = async () => {
    if (!newCategoryName.trim() || !restaurantId) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/partner/restaurants/${restaurantId}/categories`, {
        method: 'POST', headers, body: JSON.stringify({ name: newCategoryName })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create category');
      setCategories((prev) => [...prev, data.data]);
      setNewCategoryName('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unexpected error'); } finally { setLoading(false); }
  };

  const addItem = async () => {
    if (!restaurantId || !newItem.name.trim() || !newItem.price) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/partner/restaurants/${restaurantId}/menu-items`, {
        method: 'POST', headers, body: JSON.stringify({
          category_id: selectedCategoryId ? Number(selectedCategoryId) : null,
          name: newItem.name,
          description: newItem.description || null,
          price_cents: Math.round(Number(newItem.price) * 100),
          is_available: true
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create item');
      setItems((prev) => [data.data, ...prev]);
      setNewItem({ name: '', description: '', price: '' });
    } catch (e) { setError(e instanceof Error ? e.message : 'Unexpected error'); } finally { setLoading(false); }
  };

  const toggleAvailability = async (item: Item) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/partner/restaurants/${restaurantId}/menu-items/${item.id}/availability`, {
        method: 'PATCH', headers, body: JSON.stringify({ is_available: !item.is_available })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update');
      setItems((prev) => prev.map((it) => it.id === item.id ? { ...it, is_available: !it.is_available } : it));
    } catch (e) { setError(e instanceof Error ? e.message : 'Unexpected error'); } finally { setLoading(false); }
  };

  const uploadImage = async (item: Item, file: File) => {
    if (!restaurantId || !file) return;
    setUploadingId(item.id); setError(null);
    try {
      const form = new FormData();
      form.append('image', file);
      const res = await fetch(`${API_BASE_URL}/api/partner/restaurants/${restaurantId}/menu-items/${item.id}/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${auth.token}` },
        body: form
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Upload failed');
      setItems(prev => prev.map(it => it.id === item.id ? data.data : it));
    } catch (e) { setError(e instanceof Error ? e.message : 'Unexpected error'); } finally { setUploadingId(null); }
  };

  return (
    <PartnerGuard>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h5" gutterBottom>Menu Management</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Restaurant</Typography>
          <TextField select value={restaurantId} onChange={(e) => setRestaurantId(e.target.value)} sx={{ minWidth: 320 }}>
            {restaurants.map(r => (
              <MenuItem key={r.id} value={String(r.id)}>{r.name}</MenuItem>
            ))}
          </TextField>
        </Paper>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Categories</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <TextField label="New category" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} size="small" fullWidth />
                <Button onClick={addCategory} disabled={loading || !newCategoryName.trim()} variant="contained">Add</Button>
              </Box>
              <List dense>
                {categories.map(c => (
                  <ListItem key={c.id} selected={String(c.id) === selectedCategoryId} onClick={() => setSelectedCategoryId(String(c.id))} sx={{ cursor: 'pointer' }}>
                    <ListItemText primary={c.name} secondary={`Position: ${c.position}`} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Add Item</Typography>
              <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: '1fr 2fr 1fr auto' }}>
                <TextField label="Name" value={newItem.name} onChange={(e) => setNewItem(v => ({ ...v, name: e.target.value }))} size="small" />
                <TextField label="Description" value={newItem.description} onChange={(e) => setNewItem(v => ({ ...v, description: e.target.value }))} size="small" />
                <TextField label="Price (USD)" value={newItem.price} onChange={(e) => setNewItem(v => ({ ...v, price: e.target.value }))} size="small" />
                <Button onClick={addItem} disabled={loading || !newItem.name.trim() || !newItem.price} variant="contained">Create</Button>
              </Box>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Items {selectedCategoryId && `(Category ${selectedCategoryId})`}</Typography>
              <List>
                {items.map(it => (
                  <ListItem key={it.id}
                    secondaryAction={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <label>
                          <Input type="file" inputProps={{ accept: 'image/*' }} onChange={(e) => e.target.files && e.target.files[0] && uploadImage(it, e.target.files[0])} disabled={uploadingId === it.id} />
                        </label>
                        <IconButton edge="end" onClick={() => toggleAvailability(it)} aria-label="toggle">
                          {it.is_available ? <ToggleOnIcon color="success" /> : <ToggleOffIcon color="disabled" />}
                        </IconButton>
                      </Stack>
                    }
                  >
                    <ListItemText
                      primary={`${it.name} — $${(it.price_cents / 100).toFixed(2)}`}
                      secondary={<>
                        <div>{it.description || 'No description'}</div>
                        {it['image_url'] && <img src={it['image_url']} alt={it.name} style={{ marginTop: 8, width: 96, height: 96, objectFit: 'cover', borderRadius: 8 }} />}
                        {it['image_url'] && <Button size="small" color="error" onClick={async () => {
                          try {
                            const res = await fetch(`${API_BASE_URL}/api/partner/restaurants/${restaurantId}/menu-items/${it.id}/image`, { method: 'DELETE', headers: { Authorization: `Bearer ${auth.token}` } });
                            const data = await res.json();
                            if (!res.ok || !data.success) throw new Error(data.error || 'Delete failed');
                            setItems(prev => prev.map(x => x.id === it.id ? { ...x, image_url: null as any } : x));
                          } catch (e) { setError(e instanceof Error ? e.message : 'Unexpected error'); }
                        }}>Remove Image</Button>}
                      </>}
                    />
                  </ListItem>
                ))}
                {items.length === 0 && <ListItem><ListItemText primary="No items yet." /></ListItem>}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </PartnerGuard>
  );
}


