import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';
import { formatPrice } from '../util/format';

interface CartProviderProps
{
  children: ReactNode;
}

interface UpdateProductAmount
{
  productId: number;
  amount: number;
}

interface CartContextData
{
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
  // loadProducts: () => Promise<ProductFormatted[]>;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element
{
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>(() =>
  {

    const storagedCart = localStorage.getItem('@RocketShoes:cart');
    console.log("🚀 ~ storagedCart", storagedCart);

    if (storagedCart)
    {
      return JSON.parse(storagedCart);
    }
    else
    {

      return [];
    }

  });


  useEffect(() =>
  {

    async function loadProducts() 
    {

      const { data } = await api.get("products")
      if (data)
      {
        setProducts(data)
      }

    }
    loadProducts();
  }, [])

  const addProduct = async (productId: number) =>
  {
    try
    {
      const response: Product[] = []
      const product = products.find(product => product.id === productId)
      if (product)
      {
        response.push(...cart, product)
      }
      if (response)
      {
        setCart(response)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(response))
      }
    } catch {

      console.log("🚀 ~ catch ADDPRODUCT");
    }
  };

  const removeProduct = (productId: number) =>
  {
    try
    {
      const response: Product[] = []
      const product = products.findIndex(product => product.id === productId)
      if (product)
      {
        response.push(...cart)
        response.splice(1, product)
      }
      if (response)
      {
        setCart(response)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(response))
      }
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) =>
  {
    try
    {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addProduct,
        removeProduct,
        updateProductAmount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData
{
  const context = useContext(CartContext);

  return context;
}
