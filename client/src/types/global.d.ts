declare module '@contexts/AuthContext' {
  export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  }

  export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
  }

  export interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }

  export const AuthProvider: React.FC<{ children: React.ReactNode }>;
  export const useAuth: () => AuthContextType;
  export default AuthContextType;
}

declare module '@styles/theme' {
  import { Theme, ThemeOptions } from '@mui/material/styles';
  
  export interface CustomTheme extends Theme {
    status?: {
      danger: string;
    };
    mode: 'light' | 'dark';
  }
  
  export interface CustomThemeOptions extends ThemeOptions {
    status?: {
      danger: string;
    };
    mode?: 'light' | 'dark';
  }

  export const createThemeOptions: (mode: 'light' | 'dark') => CustomThemeOptions;
  const theme: CustomTheme;
  export default theme;
}

declare module '@components/Toast' {
  import { FC } from 'react';
  
  export interface ShowToast {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
  }

  export const Toast: FC;
  export const showToast: ShowToast;
  export default Toast;
}

declare module '@components/Layout' {
  import { FC } from 'react';

  export interface LayoutProps {
    children: React.ReactNode;
  }

  export interface HeaderProps {
    onMenuClick?: () => void;
    title?: string;
  }

  export interface SidebarProps {
    open: boolean;
    onClose: () => void;
    items: NavigationItem[];
  }

  export interface NavigationItem {
    title: string;
    path: string;
    icon?: React.ElementType;
    children?: NavigationItem[];
  }

  export const Layout: FC<LayoutProps>;
  export const Header: FC<HeaderProps>;
  export const Sidebar: FC<SidebarProps>;
}

declare module '@components/Form' {
  import { FC } from 'react';
  import { TextFieldProps } from '@mui/material';

  export interface FormFieldProps extends Omit<TextFieldProps, 'error'> {
    name: string;
    label: string;
    type?: string;
    validate?: (value: any) => string | undefined;
  }

  export interface FormProps {
    onSubmit: (values: any) => Promise<void>;
    initialValues: Record<string, any>;
    validationSchema?: any;
    children: React.ReactNode;
  }

  export const FormField: FC<FormFieldProps>;
  export const Form: FC<FormProps>;
}

declare module '@api/types' {
  export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    status: number;
  }

  export interface ApiError {
    message: string;
    status: number;
    errors?: Record<string, string[]>;
  }

  export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }

  export interface QueryParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    filters?: Record<string, any>;
    include?: string[];
    [key: string]: any;
  }

  export interface BatchOperation<T = any> {
    operation: 'create' | 'update' | 'delete';
    data: T[];
  }

  export interface UploadResponse {
    url: string;
    filename: string;
    mimetype: string;
    size: number;
  }
}

declare module '@utils/types' {
  export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
  };

  export type AsyncFunction<T = void> = (...args: any[]) => Promise<T>;
  
  export interface RouteConfig {
    path: string;
    component: React.ComponentType;
    exact?: boolean;
    private?: boolean;
    roles?: string[];
    layout?: React.ComponentType;
  }

  export type ValueOf<T> = T[keyof T];

  export type Nullable<T> = T | null;

  export type Optional<T> = T | undefined;

  export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

  export type RemoveOptional<T> = {
    [K in keyof T]-?: T[K];
  };

  export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

  export interface Dimensions {
    width: number;
    height: number;
  }

  export interface Position {
    x: number;
    y: number;
  }

  export interface Size {
    small: number;
    medium: number;
    large: number;
  }

  export type ColorShade = 
    | 'lighter'
    | 'light'
    | 'main'
    | 'dark'
    | 'darker'
    | 'contrastText';

  export type Severity = 'success' | 'info' | 'warning' | 'error';

  export interface DateRange {
    startDate: Date;
    endDate: Date;
  }

  export type SortDirection = 'asc' | 'desc';

  export interface SortConfig {
    field: string;
    direction: SortDirection;
  }

  export interface PaginationConfig {
    page: number;
    limit: number;
    total: number;
  }

  export interface FilterConfig {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like';
    value: any;
  }

  export type ValidationRule = {
    type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom';
    value?: any;
    message: string;
    validator?: (value: any) => boolean | Promise<boolean>;
  };

  export interface FormConfig {
    fields: Record<string, {
      type: string;
      label: string;
      placeholder?: string;
      defaultValue?: any;
      validation?: ValidationRule[];
      options?: Array<{ label: string; value: any }>;
    }>;
  }
} 