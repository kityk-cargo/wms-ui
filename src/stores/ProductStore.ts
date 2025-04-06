import { makeAutoObservable, runInAction } from 'mobx';
import { fetchProducts, fetchProduct, Product } from '../services/api';
import { RootStore } from './RootStore';

/**
 * MobX store for product management
 */
export class ProductStore {
  // Observable state
  products: Product[] = [];
  currentProduct: Product | null = null;
  loading: boolean = false;
  error: string | null = null;

  // Root store reference
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;

    // Make all properties observable
    makeAutoObservable(this, {
      rootStore: false, // Do not make the root store reference observable
    });
  }

  /**
   * Load all products from the API
   */
  loadProducts = async (): Promise<void> => {
    this.setLoading(true);
    this.setError(null);

    try {
      const data = await fetchProducts();

      // Use runInAction to batch updates to observable state
      runInAction(() => {
        this.products = data;
        this.loading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = 'Failed to fetch products. Please try again later.';
        this.loading = false;
      });
      console.error(err);
    }
  };

  /**
   * Load a specific product by ID
   */
  loadProduct = async (id: number): Promise<void> => {
    this.setLoading(true);
    this.setError(null);

    try {
      const data = await fetchProduct(id);

      runInAction(() => {
        this.currentProduct = data;
        this.loading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = `Failed to fetch product with ID ${id}. Please try again later.`;
        this.loading = false;
      });
      console.error(err);
    }
  };

  /**
   * Set loading state
   */
  setLoading = (loading: boolean): void => {
    this.loading = loading;
  };

  /**
   * Set error message
   */
  setError = (error: string | null): void => {
    this.error = error;
  };

  /**
   * Reset the store to initial state
   */
  reset = (): void => {
    this.products = [];
    this.currentProduct = null;
    this.loading = false;
    this.error = null;
  };
}
