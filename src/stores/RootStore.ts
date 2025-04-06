import { ThemeStore } from './ThemeStore';
import { OrderStore } from './OrderStore';
import { ProductStore } from './ProductStore';

/**
 * Root store that holds references to all other stores
 */
export class RootStore {
  themeStore: ThemeStore;
  orderStore: OrderStore;
  productStore: ProductStore;

  constructor() {
    // Initialize all stores with a reference to the root store
    this.themeStore = new ThemeStore(this);
    this.orderStore = new OrderStore(this);
    this.productStore = new ProductStore(this);
  }
}

// Create a singleton instance of the root store
export const rootStore = new RootStore();
