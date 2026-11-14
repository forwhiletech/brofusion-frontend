import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrder } from '../redux/slices/orderSlice';

/** Finds an order in the store or loads it from the API (e.g. after a page reload). */
export default function useOrder(id) {
  const dispatch = useDispatch();
  const order = useSelector((s) => s.orders.orders.find((o) => o.id === id) || s.orders.admin.find((o) => o.id === id));
  const [state, setState] = useState({ loading: !order, notFound: false, error: null });

  useEffect(() => {
    let alive = true;
    dispatch(fetchOrder(id)).unwrap()
      .then(() => alive && setState({ loading: false, notFound: false, error: null }))
      .catch((e) => alive && setState({ loading: false, notFound: e?.status === 404, error: e?.status === 404 ? null : e?.message || 'Could not load order' }));
    return () => { alive = false; };
  }, [dispatch, id]);

  return { order, ...state, loading: state.loading && !order };
}
