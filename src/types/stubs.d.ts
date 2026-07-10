
declare namespace React {
  type ReactNode = any;
  interface InputHTMLAttributes<T> extends Record<string, any> {}
  interface SelectHTMLAttributes<T> extends Record<string, any> {}
  interface TextareaHTMLAttributes<T> extends Record<string, any> {}
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module 'react' {
  export const useState: any;
  export const useEffect: any;
  export const useMemo: any;
  const React: any;
  export default React;
}

declare module 'next/link' {
  const Link: any;
  export default Link;
}
declare module 'next/navigation' {
  export const redirect: any;
  export const usePathname: any;
}
declare module 'next/cache' {
  export const revalidatePath: any;
}
declare module 'next/server' {
  export const NextResponse: any;
}
declare module 'next' {
  const value: any;
  export default value;
}

declare module 'lucide-react' {
  export const ChartColumnBig: any;
  export const CircleDollarSign: any;
  export const House: any;
  export const Landmark: any;
  export const ArrowDownRight: any;
  export const ArrowUpRight: any;
  export const Wallet2: any;
}

declare module 'recharts' {
  export const Area: any;
  export const AreaChart: any;
  export const CartesianGrid: any;
  export const ResponsiveContainer: any;
  export const Tooltip: any;
  export const XAxis: any;
  export const Cell: any;
  export const Pie: any;
  export const PieChart: any;
}

declare module '@prisma/client' {
  export const prisma: any;
  export const WalletType: any;
  export const CategoryType: any;
  export const TransactionType: any;
  export const AssetType: any;
  export const PrismaClient: any;
}

declare module 'dayjs' {
  const dayjs: any;
  export default dayjs;
}

declare module 'crypto' {
  const crypto: any;
  export default crypto;
}

declare module 'next/headers' {
  export const cookies: any;
}

declare var process: any;
