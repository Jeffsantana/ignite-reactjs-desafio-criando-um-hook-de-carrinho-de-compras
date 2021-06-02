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
  const [stock, setStock] = useState<Stock[]>([])

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

  const viewProductAmount = (productId?: number) =>
  {
    const data = stock.find(product => product.id === productId)
    if (data) { return data.amount } else { return 0 }
  };
  const addProduct = async (productId: number) =>
  {
    try
    {
      const response: Product[] = []
      response.push(...cart)

      const productIndex = response.findIndex(product => product.id === productId)

      if (productIndex === -1)
      {
        const product = products.find(product => product.id === productId)
        if (product)
        {
          product.amount = 1
          response.push(product);
          setCart(response)
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(response))
        }
      } else
      {

        const amountStock = viewProductAmount(productId);

        const amountNow = response[productIndex].amount

        if (amountNow < amountStock)
        {
          const amount = amountNow + 1;

          updateProductAmount({ productId, amount })
        }
        else
        {
          throw new Error("Quantidade solicitada fora de estoque");
        }
      }

    } catch (Error)
    {
      toast.error(Error.message)
    }
  };
  const removeProduct = async (productId: number) =>
  {
    try
    {
      const response: Product[] = []
      response.push(...cart)

      response.map(product =>
      {
        if (product.id === productId)
        {
          const myEggs = cart.findIndex(index => index.id === product.id)
          response.splice(myEggs, 1)

        }
      })

      setCart(response)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(response))
    } catch (Error)
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
      // response.splice(myIndex, 1)

      // setCart(response)
      // let amount = viewProductAmount(productId);
      // amount += 1;
      // updateProductAmount({ productId, amount })

      // localStorage.setItem('@RocketShoes:cart', JSON.stringify(response))
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
      if (amount === 0)
      {
        toast.error('')
      }

      const response: Product[] = []
      response.push(...cart)

      const productIndex = response.findIndex(product => product.id === productId)
      response[productIndex].amount = amount
      setCart(response)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(response))


    }
    catch (Error)
    {
      toast.error(Error.message)
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
