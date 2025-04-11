export type OrderType = {
  customer: {
    name: string;
    address: string;
  };
  fulfillmentStatus: string;
  orderLineItems: {
    product: {
      name: string;
    };
  }[];
};