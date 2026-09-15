import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { bootstrapAuth } from './features/auth/authThunks';
import AppRouter from './routes/AppRouter';

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  return <AppRouter />;
}
