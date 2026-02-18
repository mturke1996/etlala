import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Container,
  Stack,
  useTheme,
  Dialog,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Paper,
  alpha,
  IconButton,
  Grid as MuiGrid,
} from '@mui/material';
import {
  Add,
  Search,
  AttachMoney,
  Category,
  CalendarToday,
  ArrowBack,
  TrendingDown,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../store/useDataStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatCurrency, formatDate, getExpenseCategoryLabel, expenseCategories } from '../utils/formatters';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ar';

const Grid = MuiGrid as any;

export const ExpensesPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { expenses, addExpense } = useDataStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: 'materials',
    date: dayjs(),
    invoiceNumber: '',
    notes: '',
  });

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => 
      (categoryFilter === 'all' || exp.category === categoryFilter) &&
      (exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.category.toLowerCase().includes(searchQuery.toLowerCase()))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, searchQuery, categoryFilter]);

  const chartData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });
    return Object.entries(categoryTotals).map(([key, value]) => ({
      name: getExpenseCategoryLabel(key),
      value,
    })).sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Brand-consistent chart colors
  const COLORS = ['#4a5d4a', '#8b7e6a', '#6b7f6b', '#a0524a', '#b8943a', '#4a6a8a'];

  const handleAddExpense = async () => {
    if (!expenseForm.amount || !expenseForm.description) return;
    setLoading(true);
    try {
      await addExpense({
        id: crypto.randomUUID(),
        clientId: 'general',
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        category: expenseForm.category as any,
        date: expenseForm.date.toISOString(),
        invoiceNumber: expenseForm.invoiceNumber || undefined,
        isClosed: false,
        notes: expenseForm.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user?.displayName || 'غير معروف',
      });
      setDialogOpen(false);
      setExpenseForm({
        description: '',
        amount: '',
        category: 'materials',
        date: dayjs(),
        invoiceNumber: '',
        notes: '',
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ pb: 8 }}>
      {/* Header */}
      <Box
        sx={{
          background: theme.palette.mode === 'light'
            ? 'linear-gradient(160deg, #364036 0%, #4a5d4a 100%)'
            : 'linear-gradient(160deg, #2a3a2a 0%, #364036 100%)',
          pt: 2,
          pb: 5,
          px: 2,
          position: 'relative',
          overflow: 'hidden',
          color: 'white',
        }}
      >
        <Box sx={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(ellipse at 70% 20%, rgba(200,192,176,0.08) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />

        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <IconButton onClick={() => navigate('/')} sx={{ color: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                <ArrowBack />
              </IconButton>
              <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>المصروفات</Typography>
            </Stack>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setDialogOpen(true)}
              sx={{
                bgcolor: 'rgba(200,192,176,0.9)',
                color: '#2a3a2a',
                fontWeight: 700,
                borderRadius: 2.5,
                px: 2.5,
                boxShadow: '0 4px 14px -3px rgba(200,192,176,0.4)',
                '&:hover': { bgcolor: '#c8c0b0', transform: 'scale(1.04)' },
                transition: 'all 0.25s ease',
              }}
            >
              جديد
            </Button>
          </Stack>

          {/* Stats in header */}
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 2, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.1)', boxShadow: 'none', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block' }}>إجمالي المصروفات</Typography>
                <Typography variant="body1" fontWeight={800} color="white">
                  {formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Paper sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.1)', boxShadow: 'none', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block' }}>عدد السجلات</Typography>
                <Typography variant="body1" fontWeight={800} color="white">{expenses.length}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Paper sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.1)', boxShadow: 'none', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block' }}>الفئات</Typography>
                <Typography variant="body1" fontWeight={800} color="white">{chartData.length}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ mt: -2 }}>
        {/* Chart */}
        {chartData.length > 0 && (
          <Paper sx={{ p: 3, borderRadius: '20px', mb: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <Typography variant="h6" fontWeight={700} mb={2}>توزيع المصروفات حسب الفئة</Typography>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        )}

        {/* Search */}
        {/* Search and Filter */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="بحث في المصروفات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', '& fieldset': { border: 'none' } } }}
          />
          <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              displayEmpty
              sx={{ borderRadius: '14px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
            >
              <MenuItem value="all">كل التصنيفات</MenuItem>
              {Object.entries(expenseCategories).map(([key, label]) => (
                <MenuItem key={key} value={key}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Expenses List */}
        <Stack spacing={1.5}>
          {filteredExpenses.map((exp) => (
            <Card key={exp.id} sx={{ borderRadius: '14px', boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.08), color: 'error.main', borderRadius: '10px', width: 40, height: 40 }}>
                        <Category fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography fontWeight={700} variant="body2">{exp.description}</Typography>
                        <Typography variant="caption" color="text.secondary">{getExpenseCategoryLabel(exp.category)}</Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
                      <CalendarToday sx={{ fontSize: 14 }} />
                      <Typography variant="body2">{formatDate(exp.date)}</Typography>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="body2" color="text.secondary">{exp.createdBy || '-'}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 2 }} textAlign="right">
                    <Typography fontWeight={700} color="error.main">{formatCurrency(exp.amount)}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Container>

      {/* Add Expense Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ style: { borderRadius: '20px', padding: '16px' } }}
      >
        <Typography variant="h6" fontWeight={800} mb={3}>تسجيل مصروف جديد</Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
          <Stack spacing={2.5}>
            <TextField
              label="وصف المصروف"
              fullWidth
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="المبلغ"
                type="number"
                fullWidth
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                InputProps={{ endAdornment: <InputAdornment position="end">د.ل</InputAdornment> }}
              />
              <FormControl fullWidth>
                <InputLabel>الفئة</InputLabel>
                <Select
                  value={expenseForm.category}
                  label="الفئة"
                  onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                >
                  {Object.entries(expenseCategories).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <DatePicker
              label="تاريخ المصروف"
              value={expenseForm.date}
              onChange={(newValue) => newValue && setExpenseForm({...expenseForm, date: newValue})}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <TextField
              label="ملاحظات"
              multiline
              rows={2}
              value={expenseForm.notes}
              onChange={(e) => setExpenseForm({...expenseForm, notes: e.target.value})}
            />
          </Stack>
        </LocalizationProvider>
        <Box mt={3} display="flex" gap={2}>
          <Button fullWidth onClick={() => setDialogOpen(false)} size="large" sx={{ borderRadius: '10px' }}>إلغاء</Button>
          <Button 
            fullWidth 
            variant="contained" 
            onClick={handleAddExpense}
            disabled={loading}
            size="large"
            sx={{ borderRadius: '10px', fontWeight: 700 }}
          >
            {loading ? 'جاري الحفظ...' : 'حفظ المصروف'}
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
};
