export type ProductStatus = "AVAILABLE" | "SOLD";

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type CategoryInput = {
  name: string;
  slug: string;
  icon: string | null;
  display_order: number;
  active: boolean;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url: string | null;
  status: ProductStatus;
  featured: boolean;
  created_at: string;
  updated_at: string;
  category: Category | null;
};

export type ProductInput = {
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url: string | null;
  status: ProductStatus;
  featured: boolean;
};

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: CategoryInput & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<CategoryInput> & {
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: Omit<Product, "category">;
        Insert: ProductInput & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<ProductInput> & {
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
