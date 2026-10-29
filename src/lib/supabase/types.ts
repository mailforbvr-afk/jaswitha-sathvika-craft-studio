export type ProductStatus = "AVAILABLE" | "SOLD";
export type PaymentMethod = "RAZORPAY" | "UPI";
export type PaymentStatus = "PENDING" | "PAID" | "VERIFIED" | "FAILED" | "REFUNDED";
export type FulfilmentStatus = "UNFULFILLED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export type CommerceSettings = {
  id: string;
  razorpay_enabled: boolean;
  manual_upi_enabled: boolean;
  upi_id: string | null;
  upi_qr_url: string | null;
  manual_shipping_enabled: boolean;
  shiprocket_enabled: boolean;
  shipping_charge: number;
  free_shipping_threshold: number | null;
  serviceable_pincodes: string[];
  created_at: string;
  updated_at: string;
};

export type CommerceSettingsInput = Omit<CommerceSettings, "id" | "created_at" | "updated_at">;

export type CommerceOrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type CommerceOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  upi_reference: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  payment_verified_at: string | null;
  payment_verified_by: string | null;
  courier_name: string | null;
  postage_amount: number | null;
  tracking_number: string | null;
  shipped_at: string | null;
  fulfilment_status: FulfilmentStatus;
  created_at: string;
  updated_at: string;
  items?: CommerceOrderItem[];
};

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
  catalogue_image_url: string | null;
  use_catalogue_image: boolean;
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
  catalogue_image_url: string | null;
  use_catalogue_image: boolean;
  status: ProductStatus;
  featured: boolean;
};

export type SiteSettings = {
  id: string;
  studio_name: string;
  main_title: string;
  tagline: string;
  contact_heading: string;
  contact_message: string;
  about_text: string;
  instagram_url: string | null;
  email: string | null;
  theme: string;
  header_studio_name: string;
  header_tagline: string;
  hero_badge: string;
  hero_description: string;
  hero_primary_button: string;
  hero_secondary_button: string;
  hero_visual_title: string;
  hero_visual_caption: string;
  collections_eyebrow: string;
  collections_title: string;
  collections_description: string;
  featured_eyebrow: string;
  featured_title: string;
  featured_description: string;
  gallery_eyebrow: string;
  gallery_title: string;
  gallery_description: string;
  about_eyebrow: string;
  about_title: string;
  about_highlight: string;
  story_section_title: string;
  story_section_text: string;
  story_card_1_title: string;
  story_card_1_text: string;
  story_card_2_title: string;
  story_card_2_text: string;
  story_card_3_title: string;
  story_card_3_text: string;
  contact_eyebrow: string;
  contact_button_text: string;
  footer_description: string;
  footer_copyright: string;
  hero_image_url: string | null;
  story_card_1_image_url: string | null;
  story_card_2_image_url: string | null;
  story_card_3_image_url: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
};

export type SiteSettingsInput = {
  studio_name: string;
  main_title: string;
  tagline: string;
  contact_heading: string;
  contact_message: string;
  about_text: string;
  instagram_url: string | null;
  email: string | null;
  theme: string;
  header_studio_name: string;
  header_tagline: string;
  hero_badge: string;
  hero_description: string;
  hero_primary_button: string;
  hero_secondary_button: string;
  hero_visual_title: string;
  hero_visual_caption: string;
  collections_eyebrow: string;
  collections_title: string;
  collections_description: string;
  featured_eyebrow: string;
  featured_title: string;
  featured_description: string;
  gallery_eyebrow: string;
  gallery_title: string;
  gallery_description: string;
  about_eyebrow: string;
  about_title: string;
  about_highlight: string;
  story_section_title: string;
  story_section_text: string;
  story_card_1_title: string;
  story_card_1_text: string;
  story_card_2_title: string;
  story_card_2_text: string;
  story_card_3_title: string;
  story_card_3_text: string;
  contact_eyebrow: string;
  contact_button_text: string;
  footer_description: string;
  footer_copyright: string;
  hero_image_url: string | null;
  story_card_1_image_url: string | null;
  story_card_2_image_url: string | null;
  story_card_3_image_url: string | null;
  logo_url: string | null;
};

export type Database = {
  public: {
    Tables: {
      commerce_settings: {
        Row: CommerceSettings;
        Insert: Partial<CommerceSettingsInput> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<CommerceSettingsInput> & { updated_at?: string };
        Relationships: [];
      };
      commerce_orders: {
        Row: CommerceOrder;
        Insert: Omit<CommerceOrder, "id" | "order_number" | "created_at" | "updated_at" | "items"> & { id?: string; order_number?: string; created_at?: string; updated_at?: string };
        Update: Partial<Omit<CommerceOrder, "id" | "order_number" | "created_at" | "items">> & { updated_at?: string };
        Relationships: [];
      };
      commerce_order_items: {
        Row: CommerceOrderItem;
        Insert: Omit<CommerceOrderItem, "id"> & { id?: string };
        Update: Partial<Omit<CommerceOrderItem, "id" | "order_id">>;
        Relationships: [];
      };
      site_settings: {
        Row: SiteSettings;
        Insert: SiteSettingsInput & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<SiteSettingsInput> & {
          updated_at?: string;
        };
        Relationships: [];
      };
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
