import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('med_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { success, warning, error } = useToast();

  useEffect(() => {
    localStorage.setItem('med_cart_items', JSON.stringify(items));
  }, [items]);

  const addToCart = (medicine, quantity = 1) => {
    if (!medicine.is_purchasable && medicine.stock_quantity <= 0) {
      error(`'${medicine.name}' is currently out of stock.`);
      return false;
    }
    if (medicine.is_expired) {
      error(`'${medicine.name}' has expired and cannot be purchased.`);
      return false;
    }

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === medicine.id);
      if (existingIndex > -1) {
        const newQty = prevItems[existingIndex].quantity + quantity;
        if (newQty > medicine.stock_quantity) {
          warning(`Cannot add more. Only ${medicine.stock_quantity} units available.`);
          return prevItems;
        }
        const updated = [...prevItems];
        updated[existingIndex].quantity = newQty;
        success(`Updated ${medicine.name} quantity to ${newQty}`);
        return updated;
      } else {
        if (quantity > medicine.stock_quantity) {
          warning(`Only ${medicine.stock_quantity} units available in stock.`);
          quantity = medicine.stock_quantity;
        }
        success(`Added ${medicine.name} to cart`);
        return [
          ...prevItems,
          {
            id: medicine.id,
            name: medicine.name,
            generic_name: medicine.generic_name,
            composition: medicine.composition,
            strength: medicine.strength,
            dosage_form: medicine.dosage_form,
            manufacturer: medicine.manufacturer,
            price: parseFloat(medicine.price),
            stock_quantity: medicine.stock_quantity,
            prescription_required: medicine.prescription_required,
            image_url: medicine.image_url,
            quantity: quantity,
          },
        ];
      }
    });
    return true;
  };

  const updateQuantity = (medicineId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(medicineId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === medicineId) {
          if (newQuantity > item.stock_quantity) {
            warning(`Only ${item.stock_quantity} units available.`);
            return { ...item, quantity: item.stock_quantity };
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (medicineId) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === medicineId);
      if (target) {
        success(`Removed ${target.name} from cart`);
      }
      return prev.filter((item) => item.id !== medicineId);
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const estimatedTax = Math.round(subtotal * 0.05 * 100) / 100;
  const hasPrescriptionItems = items.some((item) => item.prescription_required);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItemsCount,
        subtotal,
        estimatedTax,
        hasPrescriptionItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
