import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { createProduct } from '../../redux/slices/productSlice';
import PageHeader from '../../components/admin/PageHeader';
import ProductForm from '../../components/admin/ProductForm';

export default function AddProduct() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const submit = async (data) => {
    setSaving(true);
    const res = await dispatch(createProduct(data));
    setSaving(false);
    if (createProduct.fulfilled.match(res)) { toast.success('Product created'); navigate('/admin/products'); } else toast.error(res.payload || 'Could not create product');
  };
  return (
    <>
      <PageHeader title="Add product" subtitle="Create a new product with variants and stock" />
      <ProductForm submitLabel="Create product" saving={saving} onCancel={() => navigate('/admin/products')} onSubmit={submit} />
    </>
  );
}
