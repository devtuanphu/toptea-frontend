// Shapes returned by the Strapi `/api/site/*` endpoints.

export type MediaFile = {
  url: string;
  alternativeText?: string | null;
  width?: number | null;
  height?: number | null;
  mime?: string;
};

export type Picture = { media?: MediaFile | null; alt?: string | null } | null | undefined;

export type Seo = {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  shareImage?: MediaFile | null;
} | null;

export type LinkItem = { id?: number; label: string; url: string; openInNewTab?: boolean; mobileLabel?: string; hideOnMobile?: boolean };
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'light' | 'outline-light';
export type ButtonItem = { id?: number; label: string; url: string; variant?: ButtonVariant };
export type IconText = { id?: number; icon?: MediaFile | null; label: string; mobileLabel?: string };
export type TextCard = { id?: number; icon?: MediaFile | null; title: string; description?: string; mobileDescription?: string };
export type NumberedItem = { id?: number; number?: string; title: string; description?: string; mobileDescription?: string };
export type FormField = {
  label: string;
  placeholder?: string;
  mobileLabel?: string;
  mobilePlaceholder?: string;
  hideOnMobile?: boolean;
} | null;
export type SpecRow = { id?: number; label: string; value: string; mobileLabel?: string; mobileValue?: string; hideOnMobile?: boolean };

export type Taxonomy = { documentId: string; name: string; label?: string; slug: string; icon?: MediaFile | null };

export type Product = {
  documentId: string;
  name: string;
  slug: string;
  sku?: string;
  price: number;
  inStock?: boolean;
  shortDescription?: string;
  subtitle?: string;
  sizeLabel?: string;
  badge?: string;
  cardNote?: string;
  mobileShortDescription?: string;
  mobileCardNote?: string;
  category?: Taxonomy | null;
  brewMethods?: Taxonomy[];
  images?: Picture[];
  keyMessage?: { title: string; items?: IconText[]; note?: string } | null;
  highlight?: IconText | null;
  specs?: SpecRow[];
  sections?: Section[];
  seo?: Seo;
  updatedAt?: string;
};

export type Article = {
  documentId: string;
  title: string;
  slug: string;
  excerpt?: string;
  mobileExcerpt?: string;
  cover?: Picture;
  author?: string;
  publishedDate?: string;
  readingTime?: string;
  content?: RichBlock[];
  tags?: { id?: number; label: string }[];
  featured?: boolean;
  category?: Taxonomy | null;
  seo?: Seo;
  updatedAt?: string;
};

// Strapi "blocks" rich text
export type RichText = { type: 'text'; text: string; bold?: boolean; italic?: boolean; underline?: boolean; strikethrough?: boolean; code?: boolean };
export type RichInline = RichText | { type: 'link'; url: string; children: RichText[] };
export type RichBlock =
  | { type: 'paragraph'; children: RichInline[] }
  | { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; children: RichInline[] }
  | { type: 'quote'; children: RichInline[] }
  | { type: 'code'; children: RichText[] }
  | { type: 'list'; format: 'ordered' | 'unordered'; children: { type: 'list-item'; children: RichInline[] }[] }
  | { type: 'image'; image: MediaFile & { alternativeText?: string | null } };

// Dynamic-zone payloads differ per component; each section component reads its own fields.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Section = { __component: string; id: number; [key: string]: any };

export type Page = { title: string; seo?: Seo; sections: Section[]; updatedAt?: string };

export type Global = {
  siteName: string;
  siteUrl?: string;
  logo?: Picture;
  logoText?: string;
  tagline?: string;
  description?: string;
  hotline?: string;
  email?: string;
  address?: string;
  socials?: { id?: number; platform: string; url: string; icon?: MediaFile | null }[];
  favicon?: MediaFile | null;
  defaultSeo?: Seo;
};

export type HeaderConfig = {
  leftNav?: LinkItem[];
  rightNav?: LinkItem[];
  searchLabel?: string;
  cartLabel?: string;
  menuLabel?: string;
  closeLabel?: string;
  drawerLinksTitle?: string;
  drawerLinks?: LinkItem[];
  drawerCta?: ButtonItem | null;
  skipLinkLabel?: string;
};

export type FooterConfig = {
  description?: string;
  columns?: { id?: number; title?: string; links?: LinkItem[] }[];
  copyright?: string;
};

export type IconName =
  | 'menu' | 'close' | 'search' | 'bag' | 'user' | 'arrowRight' | 'chevronRight' | 'chevronDown'
  | 'plus' | 'minus' | 'star' | 'heart' | 'filter' | 'leaf' | 'flame' | 'droplet' | 'bottle'
  | 'play' | 'location' | 'phone' | 'mail' | 'check';
export type IconSet = Partial<Record<IconName, MediaFile | null>>;

export type SiteSettings = {
  currencySuffix?: string;
  shippingFee?: number;
  freeShippingThreshold?: number;
  productCardTagSeparator?: string;
  cartAddedMessage?: string;
  cartToastCountTemplate?: string;
  cartToastViewCartLabel?: string;
  cartToastCheckoutLabel?: string;
  cartToastCloseLabel?: string;
  cartCountLabel?: string;
  loadingLabel?: string;
  genericError?: string;
  freeLabel?: string;
  decreaseLabel?: string;
  increaseLabel?: string;
  removeLabel?: string;
  clearLabel?: string;
  mainNavLabel?: string;
  secondaryNavLabel?: string;
  filterProductsLabel?: string;
  filterArticlesLabel?: string;
  breadcrumbLabel?: string;
  bankTransferMethodCode?: string;
  bankTransferTitle?: string;
  bankTransferNote?: string;
  bankQr?: MediaFile | null;
};

export type ProductPageConfig = {
  breadcrumbLabel?: string;
  breadcrumbUrl?: string;
  addToCartLabel: string;
  addedLabel?: string;
  relatedTitle?: string;
  relatedCount?: number;
  sections?: Section[];
};

export type ArticlePageConfig = {
  relatedTitle?: string;
  relatedCount?: number;
  readMoreLabel?: string;
  sections?: Section[];
};

/** Everything a section may need besides its own fields. */
export type SiteContext = {
  global: Global;
  icons: IconSet;
  settings: SiteSettings;
};
