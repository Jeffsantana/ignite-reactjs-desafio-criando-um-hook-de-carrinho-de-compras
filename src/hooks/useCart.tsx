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
  removeOneProduct: (productId: number) => void;
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
    async function loadStock() 
    {

      const { data } = await api.get("stock")
      if (data)
      {
        setStock(data)
      }

    }
    loadProducts();
    loadStock();
  }, [])

  const addProduct = async (productId: number) =>
  {
    try
    {
      const updatedCart = [...cart];
      const productExists = updatedCart.find(product => product.id === productId)

      const stock = await api.get(`stock/${productId}`);

      const stockAmount = stock.data.amount;
      const currentAmount = productExists ? productExists.amount : 0;
      const amount = currentAmount + 1;

      if (amount > stockAmount)
      {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }
      if (productExists)
      {
        productExists.amount = amount
      }
      else
      {
        const product = await api.get(`/products/${productId}`);

        const newProduct = {
          ...product.data,
          amount: 1
        }
        updatedCart.push(newProduct);
      }

      setCart(updatedCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
    }
    catch
    {
      toast.error('Erro na adição do produto')
    }
  };
  const removeProduct = async (productId: number) =>
  {
    try
    {

      const updatedCart = [...cart]
      const productIndex = updatedCart.findIndex(index => index.id === productId)

      if (productIndex >= 0)
      {
        updatedCart.splice(productIndex, 1)
        setCart(updatedCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
      }
      else
      { throw Error(); }
    }
    catch
    {
      toast.error('Erro na remoção do produto')
    }
  };
  const removeOneProduct = async (productId: number) =>
  {
    try
    {
      const response: Product[] = []
      response.push(...cart)
      const myIndex = cart.findIndex(product => product.id === productId)
      const amountNew = response[myIndex].amount - 1;
      if (amountNew > 0)
      {
        const amount = response[myIndex].amount - 1
        updateProductAmount({ productId, amount })
      }
      if (amountNew === 0)
      {
        removeProduct(productId);
      }

    } catch (Error)
    {
      toast.error('Erro na remoção do produto')
    }
  }

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) =>
  {
    try
    {
      if (amount <= 0)
      {
        return;
      }

      const stock = await api.get(`/stock/${productId}`);

      const stockAmount = stock.data.amount;

      if (amount > stockAmount)
      {
        toast.error('Erro na alteração de quantidade do produto')
        return;
      }

      const updatedCart = [...cart];
      const productExists = updatedCart.find(product => product.id === productId);

      if (productExists)
      {
        productExists.amount = amount;
        setCart(updatedCart);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
      }
      else
      {
        throw Error();
      }

    }
    catch (Error)
    {
      toast.error('Erro na alteração de quantidade do produto')
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addProduct,
        removeProduct,
        removeOneProduct,
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
