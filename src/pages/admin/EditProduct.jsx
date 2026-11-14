import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchAdminProducts, updateProduct } from '../../redux/slices/productSlice';
import PageHeader from '../../components/admin/PageHeader';
import ProductForm from '../../components/admin/ProductForm';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';

export default function EditProduct() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { adminItems, adminStatus } = useSelector((s) => s.products);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (adminStatus === 'idle') dispatch(fetchAdminProducts()); }, [adminStatus, dispatch]);
  const product = adminItems.find((p) => p.id === id);
  if (!product && (adminStatus === 'idle' || adminStatus === 'loading')) return <Loader />;
  if (!product) return <EmptyState title="Product not found" actionText="Back to products" actionTo="/admin/products" />;
  const submit = async (data) => {
    setSaving(true);
    const res = await dispatch(updateProduct({ ...data, id: product.id }));
    setSaving(false);
    if (updateProduct.fulfilled.match(res)) { toast.success('Product updated'); navigate('/admin/products'); } else toast.error(res.payload || 'Could not update product');
  };
  return (
    <>
      <PageHeader title="Edit product" subtitle={product.name} />
      <ProductForm key={product.id} initial={product} submitLabel="Save changes" saving={saving} onCancel={() => navigate('/admin/products')} onSubmit={submit} />
    </>
  );
}
