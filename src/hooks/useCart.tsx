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
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element
{
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>(() =>
  {

    const storagedCart = localStorage.getItem('@RocketShoes:cart');


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

  const removeProduct = async (productId: number) =>
  {
    try
    {
      const response: Product[] = []
      response.push(...cart)
      cart.map(product =>
      {
        if (product.id === productId)
        {
          const myEggs = cart.findIndex(index => index.id === product.id)
          response.splice(myEggs, 1)
        }
      })

      setCart(response)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(response))
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
