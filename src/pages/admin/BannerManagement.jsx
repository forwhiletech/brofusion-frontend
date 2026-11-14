import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { deleteBanner, fetchBanners, saveBanner, toggleActive } from '../../redux/slices/adminSlice';
import PageHeader from '../../components/admin/PageHeader';
import ImageUploader from '../../components/admin/ImageUploader';
import Button from '../../components/common/Button';
import Modal, { ConfirmModal } from '../../components/common/Modal';
import SmartImage from '../../components/common/SmartImage';

const EMPTY = { title: '', subtitle: '', image: '', link: '/shop', isActive: true, displayOrder: 1 };

export default function BannerManagement() {
  const dispatch = useDispatch();
  useEffect(() => { dispatch(fetchBanners(true)); }, [dispatch]);
  const banners = useSelector((s) => [...s.admin.banners].sort((a, b) => a.displayOrder - b.displayOrder));
  const [edit, setEdit] = useState(null);
  const [errors, setErrors] = useState({});
  const [del, setDel] = useState(null);
  const set = (k, v) => setEdit({ ...edit, [k]: v });

  const done = (r, ok) => { if (r.error) { toast.error(r.payload || 'Action failed'); return false; } toast.success(ok); return true; };
  const save = async () => {
    const e = {};
    if (!edit.title.trim()) e.title = 'Title is required';
    if (!edit.image) e.image = 'Banner image is required';
    if (!edit.link.startsWith('/') && !/^https?:\/\//.test(edit.link)) e.link = 'Link must start with / or http(s)://';
    setErrors(e);
    if (Object.keys(e).length) return;
    const r = await dispatch(saveBanner({ ...edit, displayOrder: Number(edit.displayOrder) || 1 }));
    if (done(r, edit.id ? 'Banner updated' : 'Banner created')) setEdit(null);
  };

  return (
    <>
      <PageHeader title="Banners" subtitle="Hero banners shown on the home page" actions={<Button onClick={() => { setErrors({}); setEdit({ ...EMPTY, displayOrder: banners.length + 1 }); }}><FiPlus /> Add banner</Button>} />
      <div className="row g-4">
        {banners.map((b) => (
          <div className="col-md-6 col-xl-4" key={b.id}>
            <div className="banner-card">
              <div className="banner-img"><SmartImage src={b.image} alt={b.title} />{!b.isActive && <span className="tag tag-dark">Hidden</span>}</div>
              <div className="banner-body">
                <small className="text-muted">Order #{b.displayOrder}</small>
                <h6>{b.title}</h6><p>{b.subtitle}</p><code>{b.link}</code>
                <div className="banner-actions">
                  <label className="switch"><input type="checkbox" checked={b.isActive} onChange={async () => { const r = await dispatch(toggleActive({ list: 'banners', id: b.id })); if (r.error) toast.error(r.payload); }} /><span />Active</label>
                  <div><button className="icon-btn" title="Edit" onClick={() => { setErrors({}); setEdit(b); }}><FiEdit2 /></button><button className="icon-btn text-danger" title="Delete" onClick={() => setDel(b)}><FiTrash2 /></button></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Modal show={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Edit banner' : 'New banner'} footer={<><Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={save}>Save banner</Button></>}>
        {edit && (
          <>
            <label className="fld">Title<input value={edit.title} onChange={(e) => set('title', e.target.value)} className={errors.title ? 'bad' : ''} />{errors.title && <div className="field-err">{errors.title}</div>}</label>
            <label className="fld">Subtitle<input value={edit.subtitle} onChange={(e) => set('subtitle', e.target.value)} /></label>
            <div className="row g-3"><div className="col-8"><label className="fld">Link<input value={edit.link} onChange={(e) => set('link', e.target.value)} className={errors.link ? 'bad' : ''} />{errors.link && <div className="field-err">{errors.link}</div>}</label></div>
              <div className="col-4"><label className="fld">Order<input type="number" min="1" value={edit.displayOrder} onChange={(e) => set('displayOrder', e.target.value)} /></label></div></div>
            <div className="fld">Image<ImageUploader max={1} images={edit.image ? [edit.image] : []} onChange={(v) => set('image', v[0] || '')} />{errors.image && <div className="field-err">{errors.image}</div>}</div>
            <label className="f-check"><input type="checkbox" checked={edit.isActive} onChange={(e) => set('isActive', e.target.checked)} /><span>Active</span></label>
          </>
        )}
      </Modal>
      <ConfirmModal show={!!del} onClose={() => setDel(null)} title="Delete banner?" message={`“${del?.title}” will be removed from the home page.`} confirmText="Delete" onConfirm={async () => { done(await dispatch(deleteBanner(del.id)), 'Banner deleted'); setDel(null); }} />
    </>
  );
}
