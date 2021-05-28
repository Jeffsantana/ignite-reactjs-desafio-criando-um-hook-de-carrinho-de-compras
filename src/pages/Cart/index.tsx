import React, { useEffect } from 'react';
import
{
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface Product
{
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}
interface ProductFormatted extends Product
{
  totalPrice: number;
  qty: number;

}

const Cart = (): JSX.Element =>
{
  const { cart, removeProduct, updateProductAmount } = useCart();

  let cartFormatted: ProductFormatted[] = [];
  // useEffect(() => { }, [])
  cart.map(product =>
  {
    const findKey = cartFormatted.findIndex(item => item.id === product.id)

    if (findKey > -1)
    {
      cartFormatted[findKey].qty++
      cartFormatted[findKey].totalPrice += product.price
    }
    else
    {
      const productFormatted: ProductFormatted = {
        ...product,
        qty: 1,
        totalPrice: product.price
      }
      cartFormatted.push(productFormatted)
    }
  })


  const total =
    formatPrice(
      cart.reduce((sumTotal, product) =>
      {
        sumTotal += product.price
        return sumTotal
      }, 0)
    )

  function handleProductIncrement(product: Product)
  {
    // TODO
  }

  function handleProductDecrement(product: Product)
  {

  }

  function handleRemoveProduct(productId: number)
  {
    removeProduct(productId)
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cartFormatted?.map(product => (

            <tr data-testid="product" key={product.id}>

              <td>
                <img src={product.image}
                  alt={product.title} />
              </td>
              <td>
                <strong>{product.title}</strong>
                <span>{formatPrice(product.price)}</span>
              </td>
              <td>
                <div>
                  <button
                    type="button"
                    data-testid="decrement-product"
                  // disabled={product.amount <= 1}
                  // onClick={() => handleProductDecrement()}
                  >
                    <MdRemoveCircleOutline size={20} />
                  </button>
                  <input
                    type="text"
                    data-testid="product-amount"
                    readOnly
                    value={product.qty}
                  />
                  <button
                    type="button"
                    data-testid="increment-product"
                  // onClick={() => handleProductIncrement()}
                  >
                    <MdAddCircleOutline size={20} />
                  </button>
                </div>
              </td>
              <td>
                <strong>{formatPrice(product.price * product.qty)}</strong>
              </td>
              <td>
                <button
                  type="button"
                  data-testid="remove-product"
                  onClick={() => handleRemoveProduct(product.id)}
                >
                  <MdDelete size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
