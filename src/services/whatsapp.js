
const STORE_WHATSAPP_NUMBER = '9025553064';

export const sendWhatsAppOrder = ({
  items,
  customer,
  address,
  totals,
}) => {

  const productDetails = items.map((item, index) => {
    const image = item.image || item.images?.[0] || '';

    return `
${index + 1}. ${item.name}
Size: ${item.size}
Color: ${item.color}
Quantity: ${item.qty}
Price: ₹${item.price}
Subtotal: ₹${item.price * item.qty}
Product Image: ${image}
`;
  }).join('\n');

  const message = `
Hello Bro Fusion!

I would like to place an order.

CUSTOMER DETAILS
-------------------------
Name: ${customer.name}
Mobile: ${customer.phone}
Email: ${customer.email}

PRODUCT DETAILS
-------------------------
${productDetails}

DELIVERY ADDRESS
-------------------------
${address.name}
${address.addressLine1 || ''}
${address.addressLine2 || ''}
${address.city || ''}
${address.state || ''}
Pincode: ${address.pincode || ''}

ORDER SUMMARY
-------------------------
Subtotal: ₹${totals.subtotal}
Discount: ₹${totals.discount}
Total: ₹${totals.total}

Please confirm my order.

Thank you!
`;

  const whatsappUrl =
    `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
};
