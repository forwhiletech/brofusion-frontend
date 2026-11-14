/** Static presentation data (marketing imagery and the colour palette). Everything transactional comes from the API. */
const U = (id, w = 900) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const COLOR_MAP = {
  Black: '#16161a', White: '#f7f5f0', Beige: '#d8c8b0', Navy: '#1f2a44', Olive: '#6b6b3a', Grey: '#8b8b8b',
  Rust: '#a4502d', Sage: '#9caf88', Indigo: '#2f3e6b', Cream: '#f1e7d3', Burgundy: '#6d1f2f', Camel: '#b98a55',
  Sky: '#a9c7dd', Blush: '#e7c4bf', Charcoal: '#3a3a3d',
};

export const collections = [
  { title: 'Linen Edit', subtitle: 'Breathable, relaxed, effortless', image: U('1469334031218-e382a71b716b', 900), link: '/shop?search=linen' },
  { title: 'Studio Tailoring', subtitle: 'Sharp lines for work & weekend', image: U('1594938298603-c8148c4dae35', 900), link: '/shop?search=tailored' },
  { title: 'Move Collection', subtitle: 'Performance meets style', image: U('1518611012118-696072aa579a', 900), link: '/shop?category=activewear' },
];

export const heroImages = { store: U('1441986300917-64674bd600d8', 1400), about: U('1523381210434-271e8be1f52b', 1400), contact: U('1490481651871-ab68de25d43d', 1400) };
