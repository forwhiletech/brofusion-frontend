import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { deleteCategory, fetchCategories, saveCategory, toggleActive } from '../../redux/slices/adminSlice';
import PageHeader from '../../components/admin/PageHeader';
import ImageUploader from '../../components/admin/ImageUploader';
import Button from '../../components/common/Button';
import Modal, { ConfirmModal } from '../../components/common/Modal';
import SmartImage from '../../components/common/SmartImage';

const EMPTY = { name: '', description: '', image: '', isActive: true };

export default function CategoryManagement() {
  const dispatch = useDispatch();
  useEffect(() => { dispatch(fetchCategories(true)); }, [dispatch]);
  const categories = useSelector((s) => s.admin.categories);
  const products = useSelector((s) => s.products.items);
  const [edit, setEdit] = useState(null);
  const [error, setError] = useState('');
  const [del, setDel] = useState(null);

  const done = (r, ok) => { if (r.error) { toast.error(r.payload || 'Action failed'); return false; } toast.success(ok); return true; };
  const save = async () => {
    if (!edit.name.trim()) return setError('Category name is required');
    if (categories.some((c) => c.id !== edit.id && c.name.toLowerCase() === edit.name.trim().toLowerCase())) return setError('A category with this name already exists');
    const r = await dispatch(saveCategory({ ...edit, name: edit.name.trim() }));
    if (r.error) return setError(r.payload || 'Could not save category');
    done(r, edit.id ? 'Category updated' : 'Category created');
    return setEdit(null);
  };
  const tryDelete = (c) => {
    const n = products.filter((p) => p.category === c.slug).length;
    if (n > 0) toast.error(`Cannot delete: ${n} product(s) use this category`); else setDel(c);
  };

  return (
    <>
      <PageHeader title="Categories" subtitle={`${categories.length} categories`} actions={<Button onClick={() => { setError(''); setEdit({ ...EMPTY }); }}><FiPlus /> Add category</Button>} />
      <section className="panel">
        <div className="table-responsive">
          <table className="table-v">
            <thead><tr><th>Category</th><th>Slug</th><th>Products</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td><div className="cell-prod"><SmartImage src={c.image} alt="" /><div><b>{c.name}</b><small>{c.description}</small></div></div></td>
                  <td><code>{c.slug}</code></td>
                  <td>{products.filter((p) => p.category === c.slug).length}</td>
                  <td><button className={`sbadge sbadge-${c.isActive ? 'ok' : 'muted'} as-btn`} onClick={async () => { const r = await dispatch(toggleActive({ list: 'categories', id: c.id })); if (r.error) toast.error(r.payload); }}>{c.isActive ? 'Active' : 'Hidden'}</button></td>
                  <td className="text-end"><button className="icon-btn" title="Edit" onClick={() => { setError(''); setEdit(c); }}><FiEdit2 /></button><button className="icon-btn text-danger" title="Delete" onClick={() => tryDelete(c)}><FiTrash2 /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <Modal show={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Edit category' : 'New category'}
        footer={<><Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        {edit && (
          <>
            {error && <div className="alert-v alert-bad">{error}</div>}
            <label className="fld">Name<input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></label>
            <label className="fld">Description<textarea rows={2} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></label>
            <div className="fld">Image<ImageUploader max={1} images={edit.image ? [edit.image] : []} onChange={(v) => setEdit({ ...edit, image: v[0] || '' })} /></div>
            <label className="f-check"><input type="checkbox" checked={edit.isActive} onChange={(e) => setEdit({ ...edit, isActive: e.target.checked })} /><span>Active</span></label>
          </>
        )}
      </Modal>
      <ConfirmModal show={!!del} onClose={() => setDel(null)} title="Delete category?" message={`“${del?.name}” will be removed.`} confirmText="Delete" onConfirm={async () => { done(await dispatch(deleteCategory(del.id)), 'Category deleted'); setDel(null); }} />
    </>
  );
}
